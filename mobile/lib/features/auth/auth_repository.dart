import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import '../../core/graphql_client.dart';
import 'user.dart';

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.watch(graphQLClientProvider)),
);

class AuthException implements Exception {
  const AuthException(this.message);
  final String message;

  @override
  String toString() => message;
}

const _userFields = 'id name email';

class AuthRepository {
  AuthRepository(this._client);
  final GraphQLClient _client;

  Future<({String token, User user})> login(
    String email,
    String password,
  ) async {
    final result = await _client.mutate(
      MutationOptions(
        document: gql('''
          mutation Login(\$input: LoginInput!) {
            login(input: \$input) { accessToken user { $_userFields } }
          }
        '''),
        variables: {
          'input': {'email': email, 'password': password},
        },
      ),
    );
    final data = _unwrap(result)['login'] as Map<String, dynamic>;
    return (
      token: data['accessToken'] as String,
      user: User.fromJson(data['user'] as Map<String, dynamic>),
    );
  }

  Future<void> logout() async {
    final result = await _client.mutate(
      MutationOptions(document: gql('mutation Logout { logout }')),
    );
    _unwrap(result);
  }

  Future<User> me() async {
    final result = await _client.query(
      QueryOptions(
        document: gql('query Me { me { $_userFields } }'),
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );
    return User.fromJson(_unwrap(result)['me'] as Map<String, dynamic>);
  }

  Map<String, dynamic> _unwrap(QueryResult result) {
    final exception = result.exception;
    if (exception != null) throw AuthException(errorMessage(exception));
    return result.data!;
  }
}
