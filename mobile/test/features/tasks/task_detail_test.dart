import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskboard/features/tasks/task.dart';

import '../../fakes.dart';

void main() {
  FakeApi apiWithComments() {
    final api = FakeApi();
    api.tasks[0] = Task(
      id: 't1',
      title: 'Draft homepage copy',
      status: TaskStatus.todo,
      assignee: alice,
      boardId: 'b1',
      boardName: 'Website relaunch',
      comments: [
        Comment(
          id: 'c1',
          body: 'First draft is in the doc.',
          author: bob,
          createdAt: DateTime.utc(2026, 10, 1, 9),
        ),
        Comment(
          id: 'c2',
          body: 'Thanks, reviewing now.',
          author: alice,
          createdAt: DateTime.utc(2026, 10, 1, 10),
        ),
      ],
    );
    return api;
  }

  testWidgets('lists comments oldest first with their authors', (tester) async {
    await pumpApp(tester, api: apiWithComments());
    await visit(tester, '/tasks/t1');

    final first = tester.getTopLeft(find.text('First draft is in the doc.'));
    final second = tester.getTopLeft(find.text('Thanks, reviewing now.'));
    expect(first.dy, lessThan(second.dy));
    expect(find.textContaining('Bob Reyes'), findsOneWidget);
  });

  testWidgets('posts a comment', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/tasks/t1');
    expect(find.text('No comments yet.'), findsOneWidget);

    final post = find.widgetWithText(FilledButton, 'Post comment');
    expect(tester.widget<FilledButton>(post).onPressed, isNull);

    await tester.enterText(
      find.widgetWithText(TextField, 'Write a comment'),
      'Looks good to me',
    );
    await tester.pump();
    await tester.ensureVisible(post);
    await tester.tap(post);
    await tester.pumpAndSettle();

    expect(find.text('Looks good to me'), findsOneWidget);
    expect(find.text('No comments yet.'), findsNothing);
  });

  testWidgets('saves edits to title and status', (tester) async {
    final api = await pumpApp(tester);
    await visit(tester, '/tasks/t1');

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Title'),
      'Final homepage copy',
    );
    await tester.tap(find.textContaining('Done'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Save changes'));
    await tester.pumpAndSettle();

    expect(find.text('Changes saved'), findsOneWidget);
    expect(api.tasks.first.title, 'Final homepage copy');
    expect(api.tasks.first.status, TaskStatus.done);
  });

  testWidgets('deletes a task after confirmation', (tester) async {
    final api = await pumpApp(tester);
    await tester.tap(find.text('Website relaunch'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Draft homepage copy'));
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Delete task'));
    await tester.pumpAndSettle();
    expect(find.text('Delete "Draft homepage copy"?'), findsOneWidget);
    await tester.tap(find.text('Delete task'));
    await tester.pumpAndSettle();

    expect(router(tester).state.matchedLocation, '/boards/b1');
    expect(find.text('Task deleted'), findsOneWidget);
    expect(find.text('Draft homepage copy'), findsNothing);
    expect(api.tasks.any((task) => task.id == 't1'), isFalse);
  });
}
