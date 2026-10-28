import 'package:flutter_test/flutter_test.dart';

import '../fakes.dart';

void main() {
  testWidgets('signed-out deep links redirect to login', (tester) async {
    await pumpApp(tester, signedIn: false);
    expect(router(tester).state.matchedLocation, '/login');

    await visit(tester, '/tasks/t1');
    expect(router(tester).state.matchedLocation, '/login');
    expect(find.text('Sign in to Taskboard'), findsOneWidget);
  });

  testWidgets('signed-in users skip login and reach deep links', (
    tester,
  ) async {
    await pumpApp(tester);
    expect(router(tester).state.matchedLocation, '/boards');

    await visit(tester, '/login');
    expect(router(tester).state.matchedLocation, '/boards');

    await visit(tester, '/tasks/t1');
    expect(router(tester).state.matchedLocation, '/tasks/t1');
    expect(find.text('Draft homepage copy'), findsOneWidget);
  });

  testWidgets('tabs switch between boards and my tasks', (tester) async {
    await pumpApp(tester);
    await tester.tap(find.text('My tasks'));
    await tester.pumpAndSettle();
    expect(router(tester).state.matchedLocation, '/my-tasks');

    await tester.tap(find.text('Boards').last);
    await tester.pumpAndSettle();
    expect(router(tester).state.matchedLocation, '/boards');
  });
}
