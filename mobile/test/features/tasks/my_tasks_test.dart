import 'package:flutter_test/flutter_test.dart';
import 'package:taskboard/widgets/status_pill.dart';

import '../../fakes.dart';

void main() {
  testWidgets('groups my tasks by status', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/my-tasks');

    final pills = tester
        .widgetList<StatusPill>(find.byType(StatusPill))
        .map((pill) => pill.status.label);
    expect(pills, ['To do', 'In progress', 'Done']);
    expect(find.text('Draft homepage copy'), findsOneWidget);
    expect(find.text('Build pricing page'), findsOneWidget);
    expect(find.text('Set up analytics'), findsOneWidget);
    // Assigned to Bob, so not mine.
    expect(find.text('Pick a hosting plan'), findsNothing);
  });

  testWidgets('rows open task detail', (tester) async {
    await pumpApp(tester);
    await visit(tester, '/my-tasks');

    await tester.tap(find.text('Build pricing page'));
    await tester.pumpAndSettle();
    expect(router(tester).state.matchedLocation, '/tasks/t3');
    expect(find.text('Save changes'), findsOneWidget);
  });

  testWidgets('shows an empty state when nothing is assigned', (tester) async {
    await pumpApp(tester, api: FakeApi(tasks: []));
    await visit(tester, '/my-tasks');
    expect(find.text('Nothing is assigned to you right now.'), findsOneWidget);
  });
}
