// Full demo rehearsal on a simulator against the local API (not run in CI):
//   flutter test integration_test/app_test.dart -d <device id>
// Alice drives the app; Bob acts through the API like a teammate on another
// phone. Everything created is deleted at the end.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:graphql/client.dart';
import 'package:integration_test/integration_test.dart';
import 'package:taskboard/app.dart';
import 'package:taskboard/core/config.dart';
import 'package:taskboard/core/token_storage.dart';
import 'package:taskboard/widgets/status_control.dart';
import 'package:taskboard/widgets/task_card.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> pumpUntil(
    WidgetTester tester,
    Finder finder, {
    bool gone = false,
  }) async {
    final deadline = DateTime.now().add(const Duration(seconds: 15));
    while (finder.evaluate().isEmpty != gone) {
      if (DateTime.now().isAfter(deadline)) {
        throw TestFailure('Timed out waiting for $finder');
      }
      await tester.pump(const Duration(milliseconds: 100));
    }
    await tester.pump(const Duration(milliseconds: 400));
  }

  Future<void> tapAndWait(
    WidgetTester tester,
    Finder target,
    Finder until,
  ) async {
    // Hidden routes can hold a second match, so act on the first.
    await tester.ensureVisible(target.first);
    await tester.pump();
    await tester.tap(target.first);
    await pumpUntil(tester, until);
  }

  Finder field(String label) => find.widgetWithText(TextFormField, label);
  Finder lane(String label) => find.descendant(
    of: find.byType(StatusControl),
    matching: find.textContaining(label),
  );

  Future<GraphQLClient> signInAs(String email) async {
    final anonymous = GraphQLClient(
      link: HttpLink(apiUrl),
      cache: GraphQLCache(),
    );
    final result = await anonymous.mutate(
      MutationOptions(
        document: gql(r'''
          mutation Login($input: LoginInput!) { login(input: $input) { accessToken } }
        '''),
        variables: {
          'input': {'email': email, 'password': 'password123'},
        },
      ),
    );
    final token = result.data!['login']['accessToken'] as String;
    return GraphQLClient(
      link: AuthLink(getToken: () => 'Bearer $token').concat(HttpLink(apiUrl)),
      cache: GraphQLCache(),
    );
  }

  const createTask = r'''
    mutation CreateTask($input: CreateTaskInput!) { createTask(input: $input) { id } }
  ''';

  testWidgets('Alice runs the full demo while Bob hands her work', (
    tester,
  ) async {
    final stamp = DateTime.now().millisecondsSinceEpoch % 100000;
    final board = 'iOS demo $stamp';
    final renamed = '$board v2';
    final title = 'Rehearse on iPhone $stamp';
    final edited = '$title today';
    final handoff = 'Review from Bob $stamp';
    final card = find.widgetWithText(TaskCard, title);
    await TokenStorage().clear();

    await tester.pumpWidget(const ProviderScope(child: TaskboardApp()));
    await pumpUntil(tester, find.text('Sign in to Taskboard'));

    // 1. A wrong password is rejected, then Alice signs in.
    await tester.enterText(field('Email'), 'alice@example.com');
    await tester.enterText(field('Password'), 'wrong-password');
    await tapAndWait(
      tester,
      find.text('Sign in'),
      find.text('Invalid email or password'),
    );
    await tester.enterText(field('Password'), 'password123');
    await tapAndWait(
      tester,
      find.text('Sign in'),
      find.text('Website relaunch'),
    );

    // 2. Creating a board validates the name first.
    await tapAndWait(
      tester,
      find.byTooltip('New board'),
      find.widgetWithText(FilledButton, 'Create board'),
    );
    await tapAndWait(
      tester,
      find.widgetWithText(FilledButton, 'Create board'),
      find.text('Board name is required'),
    );
    await tester.enterText(field('Board name'), board);
    await tapAndWait(
      tester,
      find.widgetWithText(FilledButton, 'Create board'),
      find.text('Board created'),
    );

    // 3. The new board opens with its lanes and owner actions.
    await tapAndWait(
      tester,
      find.text(board),
      find.textContaining('Owned by Alice Santos'),
    );
    expect(find.byType(StatusControl), findsOneWidget);
    expect(find.byTooltip('Board actions'), findsOneWidget);

    // 4. Add a task assigned to Bob.
    await tapAndWait(
      tester,
      find.byTooltip('Add task'),
      find.widgetWithText(FilledButton, 'Add task'),
    );
    await tester.enterText(field('Title'), title);
    await tapAndWait(
      tester,
      find.widgetWithText(InputDecorator, 'Unassigned'),
      find.text('Assign to'),
    );
    await tester.tap(find.text('Bob Reyes').last);
    await pumpUntil(tester, find.widgetWithText(InputDecorator, 'Bob Reyes'));
    // The empty lane behind the sheet has its own "Add task" button.
    await tapAndWait(
      tester,
      find.widgetWithText(FilledButton, 'Add task').last,
      card,
    );

    // 5. Swipe moves it to In progress; the card's menu moves it to Done.
    await tester.fling(card, const Offset(-400, 0), 1500);
    await pumpUntil(tester, find.text('Move to In progress'));
    await tapAndWait(
      tester,
      find.text('Move to In progress'),
      find.text('Moved to In progress'),
    );
    await tapAndWait(tester, lane('In progress'), card);
    await tapAndWait(
      tester,
      find.descendant(of: card, matching: find.byTooltip('Move task')),
      find.text('Move to Done'),
    );
    await tapAndWait(
      tester,
      find.text('Move to Done'),
      find.text('Moved to Done'),
    );
    await tapAndWait(tester, lane('Done'), card);

    // 6. Edit the task and post a comment.
    await tapAndWait(tester, card, find.text('Save changes'));
    await tester.enterText(field('Title'), edited);
    await tapAndWait(
      tester,
      find.text('Save changes'),
      find.text('Changes saved'),
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Write a comment'),
      'Ready for the walkthrough.',
    );
    await tester.pump(const Duration(milliseconds: 500));
    await tester.ensureVisible(
      find.widgetWithText(FilledButton, 'Post comment'),
    );
    await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Post comment'));
    // Text widgets only: the field still holds the text until it posts.
    await pumpUntil(
      tester,
      find.byWidgetPredicate(
        (w) => w is Text && w.data == 'Ready for the walkthrough.',
      ),
    );
    await tester.pageBack();
    await pumpUntil(tester, find.textContaining('Owned by Alice Santos'));

    // 7. Rename the board.
    await tapAndWait(
      tester,
      find.byTooltip('Board actions'),
      find.text('Rename'),
    );
    await tapAndWait(tester, find.text('Rename'), find.text('Rename board'));
    await tester.enterText(field('Board name'), renamed);
    await tapAndWait(
      tester,
      find.widgetWithText(FilledButton, 'Save name'),
      find.text('Board renamed'),
    );
    await pumpUntil(tester, find.text(renamed));

    // 8. Bob assigns Alice a task from his phone; she is notified live.
    final bob = await signInAs('bob@example.com');
    final lookup = await bob.query(
      QueryOptions(
        document: gql('query Lookup { users { id email } boards { id name } }'),
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );
    final users = (lookup.data!['users'] as List).cast<Map<String, dynamic>>();
    final boards = (lookup.data!['boards'] as List)
        .cast<Map<String, dynamic>>();
    final boardId = boards.firstWhere((b) => b['name'] == renamed)['id'];
    Future<Map<String, dynamic>> asBob(
      String document,
      Map<String, dynamic> input,
    ) async {
      final result = await bob.mutate(
        MutationOptions(document: gql(document), variables: {'input': input}),
      );
      if (result.hasException) throw TestFailure('${result.exception}');
      return result.data!;
    }

    await asBob(createTask, {
      'boardId': boardId,
      'title': handoff,
      'assigneeId': users.firstWhere(
        (u) => u['email'] == 'alice@example.com',
      )['id'],
    });
    await pumpUntil(tester, find.text('Bob Reyes assigned you "$handoff"'));
    await tapAndWait(
      tester,
      find.widgetWithText(SnackBarAction, 'View'),
      find.widgetWithText(TextFormField, handoff),
    );
    await tester.pageBack();
    await pumpUntil(tester, find.text(renamed));

    // 9. Bob adds, moves, comments on and deletes a task while Alice
    // watches; each change shows up live, without pull-to-refresh.
    final live = 'Live from Bob $stamp';
    final liveCard = find.widgetWithText(TaskCard, live);
    final liveComment = 'Bob is on it $stamp';
    await tapAndWait(
      tester,
      lane('To do'),
      find.widgetWithText(TaskCard, handoff),
    );
    final created = await asBob(createTask, {
      'boardId': boardId,
      'title': live,
    });
    final liveId = created['createTask']['id'] as String;
    await pumpUntil(tester, liveCard);
    await asBob(
      r'''
      mutation UpdateTask($input: UpdateTaskInput!) { updateTask(input: $input) { id } }
    ''',
      {'id': liveId, 'status': 'IN_PROGRESS'},
    );
    await pumpUntil(tester, liveCard, gone: true);
    await tapAndWait(tester, lane('In progress'), liveCard);
    await tapAndWait(
      tester,
      liveCard,
      find.widgetWithText(TextFormField, live),
    );
    await asBob(
      r'''
      mutation AddComment($input: AddCommentInput!) { addComment(input: $input) { id } }
    ''',
      {'taskId': liveId, 'body': liveComment},
    );
    await pumpUntil(tester, find.text(liveComment));
    // Bob deletes it; Alice's open task closes back to the board.
    await bob.mutate(
      MutationOptions(
        document: gql(r'mutation DeleteTask($id: ID!) { deleteTask(id: $id) }'),
        variables: {'id': liveId},
      ),
    );
    await pumpUntil(tester, find.text('This task was deleted'));
    await pumpUntil(tester, find.text(renamed));
    expect(liveCard, findsNothing);

    // 10. My tasks lists the hand-off.
    await tapAndWait(tester, find.text('My tasks').last, find.text(handoff));

    // 11. Bob's board offers Alice no owner actions.
    await tapAndWait(
      tester,
      find.text('Boards').last,
      find.textContaining('Owned by Alice Santos'),
    );
    await tapAndWait(
      tester,
      find.text('Boards').last,
      find.byTooltip('Account'),
    );
    await tapAndWait(
      tester,
      find.text('Mobile app beta'),
      find.textContaining('Owned by Bob Reyes'),
    );
    expect(find.byTooltip('Board actions'), findsNothing);
    await tester.pageBack();
    await pumpUntil(tester, find.byTooltip('Account'));

    // 12. Deleting the board removes it and its tasks.
    await tapAndWait(
      tester,
      find.text(renamed),
      find.textContaining('Owned by Alice Santos'),
    );
    await tapAndWait(
      tester,
      find.byTooltip('Board actions'),
      find.text('Delete board'),
    );
    await tapAndWait(
      tester,
      find.text('Delete board'),
      find.text('Delete "$renamed" and its tasks?'),
    );
    await tapAndWait(
      tester,
      find.text('Delete board').last,
      find.text('Board deleted'),
    );
    await pumpUntil(tester, find.text(renamed), gone: true);

    // 13. Sign out.
    await tapAndWait(tester, find.byTooltip('Account'), find.text('Sign out'));
    await tapAndWait(
      tester,
      find.text('Sign out'),
      find.text('Sign in to Taskboard'),
    );
  });
}
