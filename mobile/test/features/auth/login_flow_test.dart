import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskboard/app.dart';
import 'package:taskboard/core/token_storage.dart';
import 'package:taskboard/features/auth/auth_repository.dart';

import '../../fakes.dart';

void main() {
  Future<void> pumpApp(WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          tokenStorageProvider.overrideWithValue(MemoryTokenStorage()),
          authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
        ],
        child: const TaskboardApp(),
      ),
    );
    await tester.pumpAndSettle();
  }

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
    await pumpApp(tester);
    expect(find.text('Sign in to Taskboard'), findsOneWidget);

    await tester.tap(find.text('Sign in'));
    await tester.pump();
    expect(find.text('Required'), findsNWidgets(2));
  });

  testWidgets('signs in, lands on boards, and signs out', (tester) async {
    await pumpApp(tester);
    await signIn(tester, 'password123');
    expect(find.text('Boards'), findsOneWidget);
    expect(find.text('Alice'), findsOneWidget);

    await tester.tap(find.byTooltip('Sign out'));
    await tester.pumpAndSettle();
    expect(find.text('Sign in to Taskboard'), findsOneWidget);
  });

  testWidgets('shows the API error on bad credentials', (tester) async {
    await pumpApp(tester);
    await signIn(tester, 'wrong');
    expect(find.text('Invalid email or password'), findsOneWidget);
  });
}
