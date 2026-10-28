import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import 'config.dart';
import 'token_storage.dart';

final graphQLClientProvider = Provider<GraphQLClient>((ref) {
  final storage = ref.watch(tokenStorageProvider);
  final auth = AuthLink(
    getToken: () async {
      final token = await storage.read();
      return token == null ? null : 'Bearer $token';
    },
  );
  return GraphQLClient(
    link: auth.concat(HttpLink(apiUrl)),
    cache: GraphQLCache(),
  );
});

/// Reads the first GraphQL error message, falling back to a generic one.
String errorMessage(OperationException exception) {
  final errors = exception.graphqlErrors;
  return errors.isNotEmpty ? errors.first.message : 'Network error';
}

class ApiException implements Exception {
  const ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

extension GraphQLClientData on GraphQLClient {
  Future<Map<String, dynamic>> queryData(
    String document, [
    Map<String, dynamic> variables = const {},
  ]) async => _data(
    await query(
      QueryOptions(
        document: gql(document),
        variables: variables,
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    ),
  );

  Future<Map<String, dynamic>> mutateData(
    String document,
    Map<String, dynamic> variables,
  ) async => _data(
    await mutate(
      MutationOptions(document: gql(document), variables: variables),
    ),
  );

  Map<String, dynamic> _data(QueryResult result) {
    final exception = result.exception;
    if (exception != null) throw ApiException(errorMessage(exception));
    return result.data!;
  }
}
