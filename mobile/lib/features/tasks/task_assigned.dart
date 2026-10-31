import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/graphql/operations.g.dart';
import '../../core/live_client.dart';
import 'task.dart';

final taskAssignedProvider = StreamProvider.autoDispose<TaskAssignment>(
  (ref) => liveEvents(ref, taskAssignedSubscription).map(
    (data) =>
        TaskAssignment.fromJson(data['taskAssigned'] as Map<String, dynamic>),
  ),
);
