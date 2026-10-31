import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import '../features/auth/auth_controller.dart';
import 'config.dart';
import 'token_storage.dart';

/// One WebSocket per signed-in user, shared by every subscription. A new
/// user gets a new socket and the old one closes; the main client stays
/// HTTP-only.
final liveClientProvider = FutureProvider.autoDispose<GraphQLClient?>((
  ref,
) async {
  final userId = ref.watch(
    authControllerProvider.select((auth) => auth.value?.id),
  );
  if (userId == null) return null;
  final token = await ref.read(tokenStorageProvider).read();
  if (token == null || !ref.mounted) return null;

  final link = WebSocketLink(
    apiUrl.replaceFirst('http', 'ws'),
    subProtocol: GraphQLProtocol.graphqlTransportWs,
    config: SocketClientConfig(
      initialPayload: {'authorization': 'Bearer $token'},
    ),
  );
  ref.onDispose(link.dispose);
  return GraphQLClient(link: link, cache: GraphQLCache());
});

/// Event data for [document], streamed over the shared socket.
Stream<Map<String, dynamic>> liveEvents(Ref ref, String document) async* {
  final client = await ref.watch(liveClientProvider.future);
  if (client == null) return;
  yield* client
      .subscribe(SubscriptionOptions(document: gql(document)))
      .where((result) => result.data != null)
      .map((result) => result.data!);
}
