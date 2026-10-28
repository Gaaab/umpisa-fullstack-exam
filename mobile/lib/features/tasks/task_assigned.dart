import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';

import '../../core/config.dart';
import '../../core/token_storage.dart';
import '../auth/auth_controller.dart';
import 'task.dart';

/// Live "assigned to you" events. Rebuilds (and drops the old socket) when
/// the signed-in user changes; the main client stays HTTP-only.
final taskAssignedProvider = StreamProvider.autoDispose<TaskAssignment>((
  ref,
) async* {
  final userId = ref.watch(
    authControllerProvider.select((auth) => auth.value?.id),
  );
  if (userId == null) return;
  final token = await ref.read(tokenStorageProvider).read();
  if (token == null || !ref.mounted) return;

  final link = WebSocketLink(
    apiUrl.replaceFirst('http', 'ws'),
    subProtocol: GraphQLProtocol.graphqlTransportWs,
    config: SocketClientConfig(
      initialPayload: {'authorization': 'Bearer $token'},
    ),
  );
  ref.onDispose(link.dispose);
  final client = GraphQLClient(link: link, cache: GraphQLCache());

  yield* client
      .subscribe(
        SubscriptionOptions(
          document: gql('''
            subscription TaskAssigned {
              taskAssigned { assignedBy { id name } task { id title } }
            }
          '''),
        ),
      )
      .where((result) => result.data != null)
      .map(
        (result) => TaskAssignment.fromJson(
          result.data!['taskAssigned'] as Map<String, dynamic>,
        ),
      );
});
