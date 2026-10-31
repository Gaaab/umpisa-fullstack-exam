import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/live_client.dart';
import 'task.dart';

final taskAssignedProvider = StreamProvider.autoDispose<TaskAssignment>(
  (ref) =>
      liveEvents(ref, '''
        subscription TaskAssigned {
          taskAssigned { assignedBy { id name } task { id title } }
        }
      ''').map(
        (data) => TaskAssignment.fromJson(
          data['taskAssigned'] as Map<String, dynamic>,
        ),
      ),
);
