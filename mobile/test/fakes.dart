import 'package:taskboard/core/token_storage.dart';
import 'package:taskboard/features/auth/auth_repository.dart';
import 'package:taskboard/features/auth/user.dart';

const alice = User(id: 'u1', name: 'Alice', email: 'alice@example.com');

class MemoryTokenStorage implements TokenStorage {
  String? token;

  @override
  Future<String?> read() async => token;
  @override
  Future<void> write(String value) async => token = value;
  @override
  Future<void> clear() async => token = null;
}

class FakeAuthRepository implements AuthRepository {
  @override
  Future<({String token, User user})> login(
    String email,
    String password,
  ) async {
    if (password != 'password123') {
      throw const AuthException('Invalid email or password');
    }
    return (token: 'jwt', user: alice);
  }

  @override
  Future<User> me() async => alice;
}
