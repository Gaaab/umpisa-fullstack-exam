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
