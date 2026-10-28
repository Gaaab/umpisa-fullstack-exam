// Manual rehearsal against the local API on a simulator (not run in CI):
//   flutter test integration_test/app_test.dart -d <device id>
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:taskboard/app.dart';
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
    await tester.tap(target);
    await pumpUntil(tester, until);
  }

  testWidgets('Alice adds, moves, discusses and deletes a task', (
    tester,
  ) async {
    final title = 'Rehearsal ${DateTime.now().millisecondsSinceEpoch}';
    final card = find.widgetWithText(TaskCard, title);
    await TokenStorage().clear();

    await tester.pumpWidget(const ProviderScope(child: TaskboardApp()));
    await pumpUntil(tester, find.text('Sign in to Taskboard'));

    // Sign in.
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Email'),
      'alice@example.com',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Password'),
      'password123',
    );
    await tapAndWait(
      tester,
      find.text('Sign in'),
      find.text('Website relaunch'),
    );

    // Open the board and add a task assigned to Alice.
    await tapAndWait(
      tester,
      find.text('Website relaunch'),
      find.textContaining('Owned by Alice Santos'),
    );
    await tapAndWait(
      tester,
      find.byTooltip('Add task'),
      find.widgetWithText(FilledButton, 'Add task'),
    );
    await tester.enterText(find.widgetWithText(TextFormField, 'Title'), title);
    await tapAndWait(
      tester,
      find.widgetWithText(InputDecorator, 'Unassigned'),
      find.text('Assign to'),
    );
    await tester.tap(find.text('Alice Santos').last);
    await pumpUntil(
      tester,
      find.widgetWithText(InputDecorator, 'Alice Santos'),
    );
    await tapAndWait(
      tester,
      find.widgetWithText(FilledButton, 'Add task'),
      card,
    );

    // Move it with the card's action sheet.
    await tester.ensureVisible(card);
    await tester.pump();
    await tapAndWait(
      tester,
      find.descendant(of: card, matching: find.byTooltip('Move task')),
      find.text('Move to In progress'),
    );
    await tapAndWait(
      tester,
      find.text('Move to In progress'),
      find.text('Moved to In progress'),
    );
    expect(card, findsNothing);
    await tapAndWait(
      tester,
      find.descendant(
        of: find.byType(StatusControl),
        matching: find.textContaining('In progress'),
      ),
      card,
    );

    // Open it and post a comment.
    await tester.ensureVisible(card);
    await tapAndWait(tester, card, find.text('Save changes'));
    final post = find.widgetWithText(FilledButton, 'Post comment');
    await tester.enterText(
      find.widgetWithText(TextField, 'Write a comment'),
      'Rehearsal comment',
    );
    await tester.pump(const Duration(milliseconds: 500));
    await tester.ensureVisible(post);
    await tester.pump();
    await tester.tap(post);
    // Text widgets only: the field still holds the text until it posts.
    await pumpUntil(
      tester,
      find.byWidgetPredicate(
        (widget) => widget is Text && widget.data == 'Rehearsal comment',
      ),
    );
    expect(find.textContaining('Alice Santos'), findsWidgets);
    await tester.pageBack();
    await pumpUntil(tester, find.textContaining('Owned by Alice Santos'));

    // It shows up in My tasks; clean up by deleting it from there.
    await tapAndWait(tester, find.text('My tasks').last, find.text(title));
    await tapAndWait(tester, find.text(title), find.text('Save changes'));
    await tapAndWait(
      tester,
      find.byTooltip('Delete task'),
      find.text('Delete "$title"?'),
    );
    await tapAndWait(
      tester,
      find.text('Delete task'),
      find.text('Task deleted'),
    );
    await pumpUntil(tester, find.text(title), gone: true);

    // Back to the Boards tab; tapping it again returns to its root.
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
    await tapAndWait(tester, find.byTooltip('Account'), find.text('Sign out'));
    await tapAndWait(
      tester,
      find.text('Sign out'),
      find.text('Sign in to Taskboard'),
    );
  });
}
