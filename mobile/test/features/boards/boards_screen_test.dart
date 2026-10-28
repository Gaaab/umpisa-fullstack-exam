import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../fakes.dart';

void main() {
  testWidgets('lists boards with owner and open task count', (tester) async {
    await pumpApp(tester);
    expect(find.text('Website relaunch'), findsOneWidget);
    expect(find.text('Alice Santos · 3 open'), findsOneWidget);
    expect(find.text('Mobile app beta'), findsOneWidget);
    expect(find.text('Bob Reyes · 1 open'), findsOneWidget);
  });

  testWidgets('shows an empty state without boards', (tester) async {
    await pumpApp(
      tester,
      api: FakeApi(boards: [], tasks: []),
    );
    expect(
      find.text('No boards yet. Create one to start planning.'),
      findsOneWidget,
    );
  });

  testWidgets('creates a board from the sheet', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.byTooltip('New board'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Create board'));
    await tester.pumpAndSettle();
    expect(find.text('Board name is required'), findsOneWidget);

    await tester.enterText(find.byType(TextFormField), 'Q4 planning');
    await tester.tap(find.text('Create board'));
    await tester.pumpAndSettle();

    expect(find.text('Board created'), findsOneWidget);
    expect(find.text('Q4 planning'), findsOneWidget);
    expect(find.text('Alice Santos · No open tasks'), findsOneWidget);
  });

  testWidgets('opens a board', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('Website relaunch'));
    await tester.pumpAndSettle();
    expect(router(tester).state.matchedLocation, '/boards/b1');
    expect(find.text('Owned by Alice Santos · 3 open'), findsOneWidget);
  });
}
