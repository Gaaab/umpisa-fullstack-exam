import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../fakes.dart';

void main() {
  Future<void> signIn(WidgetTester tester, String password) async {
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Email'),
      'alice@example.com',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Password'),
      password,
    );
    await tester.tap(find.text('Sign in'));
    await tester.pumpAndSettle();
  }

  testWidgets('redirects to login and validates empty fields', (tester) async {
    await pumpApp(tester, signedIn: false);
    expect(find.text('Sign in to Taskboard'), findsOneWidget);

    await tester.tap(find.text('Sign in'));
    await tester.pump();
    expect(find.text('Required'), findsNWidgets(2));
  });

  testWidgets('signs in, lands on boards, and signs out', (tester) async {
    await pumpApp(tester, signedIn: false);
    await signIn(tester, 'password123');
    expect(find.text('Boards'), findsWidgets);
    expect(find.text('Website relaunch'), findsOneWidget);

    await tester.tap(find.byTooltip('Account'));
    await tester.pumpAndSettle();
    expect(find.text('alice@example.com'), findsOneWidget);

    await tester.tap(find.text('Sign out'));
    await tester.pumpAndSettle();
    expect(find.text('Sign in to Taskboard'), findsOneWidget);
  });

  testWidgets('shows the API error on bad credentials', (tester) async {
    await pumpApp(tester, signedIn: false);
    await signIn(tester, 'wrong');
    expect(find.text('Invalid email or password'), findsOneWidget);
  });
}
