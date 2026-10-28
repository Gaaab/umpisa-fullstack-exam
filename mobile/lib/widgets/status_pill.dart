import 'package:flutter/material.dart';

import '../features/tasks/task.dart';

class StatusPill extends StatelessWidget {
  const StatusPill(this.status, {super.key});

  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: ShapeDecoration(
        color: status.tint,
        shape: const StadiumBorder(),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Text(
          status.label,
          style: TextStyle(
            color: status.text,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
