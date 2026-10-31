import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskboard/widgets/status_control.dart';
import 'package:taskboard/widgets/task_card.dart';

import '../../fakes.dart';

void main() {
  Finder card(String title) => find.widgetWithText(TaskCard, title);
  Finder lane(String label) => find.descendant(
    of: find.byType(StatusControl),
    matching: find.textContaining(label),
  );

  Future<void> moveViaSheet(
    WidgetTester tester,
    String title,
    String action,
  ) async {
    await tester.tap(
      find.descendant(of: card(title), matching: find.byTooltip('Move task')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text(action));
    await tester.pumpAndSettle();
  }

  testWidgets('shows one lane at a time with counts', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/boards/b1');

    expect(card('Draft homepage copy'), findsOneWidget);
    expect(card('Build pricing page'), findsNothing);
    expect(find.text('To do 2', findRichText: true), findsOneWidget);

    await tester.tap(lane('In progress'));
    await tester.pumpAndSettle();
    expect(card('Build pricing page'), findsOneWidget);
    expect(card('Draft homepage copy'), findsNothing);
  });

  testWidgets('moving a task takes it out of its lane at once', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/boards/b1');

    await moveViaSheet(tester, 'Draft homepage copy', 'Move to In progress');
    expect(card('Draft homepage copy'), findsNothing);
    expect(find.text('Moved to In progress'), findsOneWidget);

    await tester.tap(lane('In progress'));
    await tester.pumpAndSettle();
    expect(card('Draft homepage copy'), findsOneWidget);
  });

  testWidgets('swiping a card opens the move sheet', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/boards/b1');

    await tester.drag(card('Draft homepage copy'), const Offset(-300, 0));
    await tester.pumpAndSettle();
    expect(find.text('Move to In progress'), findsOneWidget);
    expect(card('Draft homepage copy'), findsOneWidget);
  });

  testWidgets('a rejected move returns the card and explains', (tester) async {
    final api = FakeApi()..rejectedTasks.add('t1');
    await pumpApp(tester, api: api);
    await visit(tester, '/boards/b1');

    await moveViaSheet(tester, 'Draft homepage copy', 'Move to Done');
    expect(card('Draft homepage copy'), findsOneWidget);
    expect(
      find.text("Couldn't move the task. Check your connection and try again."),
      findsOneWidget,
    );
  });

  testWidgets('adds a task to To do', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/boards/b1');

    await tester.tap(find.byTooltip('Add task'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Add task'));
    await tester.pumpAndSettle();
    expect(find.text('Task title is required'), findsOneWidget);

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Title'),
      'Write launch email',
    );
    await tester.tap(find.text('Unassigned'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bob Reyes').last);
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Add task'));
    await tester.pumpAndSettle();

    expect(find.text('Task added'), findsOneWidget);
    expect(card('Write launch email'), findsOneWidget);
  });

  testWidgets('only the owner can rename or delete', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/boards/b2');
    expect(find.byTooltip('Board actions'), findsNothing);

    await visit(tester, '/boards/b1');
    await tester.tap(find.byTooltip('Board actions'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Rename'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), 'Website v2');
    await tester.tap(find.text('Save name'));
    await tester.pumpAndSettle();
    expect(find.text('Board renamed'), findsOneWidget);
    expect(find.text('Website v2'), findsWidgets);
  });

  testWidgets('deleting a board confirms, then returns to boards', (
    tester,
  ) async {
    await pumpApp(tester);
    await tester.tap(find.text('Website relaunch'));
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Board actions'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Delete board'));
    await tester.pumpAndSettle();
    expect(
      find.text('Delete "Website relaunch" and its tasks?'),
      findsOneWidget,
    );
    await tester.tap(find.text('Delete board'));
    await tester.pumpAndSettle();

    expect(router(tester).state.matchedLocation, '/boards');
    expect(find.text('Board deleted'), findsOneWidget);
    expect(find.text('Website relaunch'), findsNothing);
  });

  group('live changes from another phone', () {
    testWidgets('a new task appears on the open board', (tester) async {
      final api = await pumpApp(tester);
      await visit(tester, '/boards/b1');

      await api.createTask(boardId: 'b1', title: 'Book the venue');
      await tester.pumpAndSettle();
      expect(card('Book the venue'), findsOneWidget);
      expect(find.text('To do 3', findRichText: true), findsOneWidget);
    });

    testWidgets('a deleted open board sends the user back to boards', (
      tester,
    ) async {
      final api = await pumpApp(tester);
      await tester.tap(find.text('Website relaunch'));
      await tester.pumpAndSettle();

      await api.deleteBoard('b1');
      await tester.pumpAndSettle();
      expect(router(tester).state.matchedLocation, '/boards');
      expect(find.text('This board was deleted'), findsOneWidget);
      expect(find.text('Website relaunch'), findsNothing);
    });

    testWidgets('a board deleted while in another tab says so on return', (
      tester,
    ) async {
      final api = await pumpApp(tester);
      await tester.tap(find.text('Website relaunch'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('My tasks'));
      await tester.pumpAndSettle();

      await api.deleteBoard('b1');
      await tester.pumpAndSettle();
      expect(router(tester).state.matchedLocation, '/my-tasks');

      await tester.tap(find.text('Boards').last);
      await tester.pumpAndSettle();
      expect(find.text('This board was deleted.'), findsOneWidget);
      await tester.tap(find.text('Back to boards'));
      await tester.pumpAndSettle();
      expect(router(tester).state.matchedLocation, '/boards');
    });
  });
}
