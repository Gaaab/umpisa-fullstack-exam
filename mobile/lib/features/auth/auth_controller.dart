import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/token_storage.dart';
import 'auth_repository.dart';
import 'user.dart';

final authControllerProvider = AsyncNotifierProvider<AuthController, User?>(
  AuthController.new,
);

/// Holds the signed-in user, or null when signed out.
class AuthController extends AsyncNotifier<User?> {
  TokenStorage get _storage => ref.read(tokenStorageProvider);
  AuthRepository get _repository => ref.read(authRepositoryProvider);

  @override
  Future<User?> build() async {
    if (await _storage.read() == null) return null;
    try {
      return await _repository.me();
    } on AuthException {
      await _storage.clear();
      return null;
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final result = await _repository.login(email, password);
      await _storage.write(result.token);
      return result.user;
    });
  }

  Future<void> logout() async {
    await _storage.clear();
    state = const AsyncData(null);
  }
}
