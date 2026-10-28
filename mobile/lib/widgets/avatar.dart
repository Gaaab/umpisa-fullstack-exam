import 'package:flutter/material.dart';

import '../core/theme.dart';

/// Initials in a circle. Decorative: callers show or announce the name.
class Avatar extends StatelessWidget {
  const Avatar(this.name, {super.key, this.size = 28});

  final String name;
  final double size;

  String get _initials => name
      .split(' ')
      .where((part) => part.isNotEmpty)
      .take(2)
      .map((part) => part[0].toUpperCase())
      .join();

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: const BoxDecoration(
          color: AppColors.wall,
          shape: BoxShape.circle,
          border: Border.fromBorderSide(BorderSide(color: AppColors.line)),
        ),
        child: Text(
          _initials,
          style: TextStyle(
            color: AppColors.ink,
            fontSize: size * 0.4,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
