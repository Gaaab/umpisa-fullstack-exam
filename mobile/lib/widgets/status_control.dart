import 'package:flutter/cupertino.dart';

import '../core/theme.dart';
import '../features/tasks/task.dart';

/// Sliding segmented control over the three statuses, each marked with its
/// lane colour. Shows per-status counts when given.
class StatusControl extends StatelessWidget {
  const StatusControl({
    super.key,
    required this.value,
    required this.onChanged,
    this.counts,
  });

  final TaskStatus value;
  final ValueChanged<TaskStatus> onChanged;
  final Map<TaskStatus, int>? counts;

  @override
  Widget build(BuildContext context) {
    return MediaQuery.withClampedTextScaling(
      maxScaleFactor: 1.5,
      child: SizedBox(
        width: double.infinity,
        child: CupertinoSlidingSegmentedControl<TaskStatus>(
          groupValue: value,
          thumbColor: AppColors.paper,
          backgroundColor: AppColors.line,
          onValueChanged: (status) {
            if (status != null) onChanged(status);
          },
          children: {
            for (final status in TaskStatus.values)
              status: _Segment(status: status, count: counts?[status]),
          },
        ),
      ),
    );
  }
}

class _Segment extends StatelessWidget {
  const _Segment({required this.status, this.count});

  final TaskStatus status;
  final int? count;

  @override
  Widget build(BuildContext context) {
    // Fixed height keeps the control a 44pt target; text scaling is clamped
    // to fit it.
    return SizedBox(
      height: 40,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: status.edge,
              shape: BoxShape.circle,
            ),
            child: const SizedBox.square(dimension: 8),
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text.rich(
              TextSpan(
                text: status.label,
                children: [
                  if (count != null)
                    TextSpan(
                      text: ' $count',
                      style: const TextStyle(color: AppColors.graphite),
                    ),
                ],
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: AppColors.ink,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
