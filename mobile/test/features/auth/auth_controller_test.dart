import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:taskboard/core/token_storage.dart';
import 'package:taskboard/features/auth/auth_controller.dart';
import 'package:taskboard/features/auth/auth_repository.dart';

import '../../fakes.dart';

void main() {
  late MemoryTokenStorage storage;
  late ProviderContainer container;

  setUp(() {
    storage = MemoryTokenStorage();
    container = ProviderContainer(
      overrides: [
        tokenStorageProvider.overrideWithValue(storage),
        authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
      ],
    );
    addTearDown(container.dispose);
  });

  AuthController controller() =>
      container.read(authControllerProvider.notifier);

  test('starts signed out without a stored token', () async {
    expect(await container.read(authControllerProvider.future), isNull);
  });

  test('restores the session from a stored token', () async {
    storage.token = 'jwt';
    expect(await container.read(authControllerProvider.future), alice);
  });

  test('login stores the token and exposes the user', () async {
    await container.read(authControllerProvider.future);
    await controller().login('alice@example.com', 'password123');
    expect(container.read(authControllerProvider).value, alice);
    expect(storage.token, 'jwt');
  });

  test('failed login surfaces the error and stores nothing', () async {
    await container.read(authControllerProvider.future);
    await controller().login('alice@example.com', 'wrong');
    expect(container.read(authControllerProvider).hasError, isTrue);
    expect(storage.token, isNull);
  });

  test('logout clears the token', () async {
    storage.token = 'jwt';
    await container.read(authControllerProvider.future);
    await controller().logout();
    expect(container.read(authControllerProvider).value, isNull);
    expect(storage.token, isNull);
  });
}
