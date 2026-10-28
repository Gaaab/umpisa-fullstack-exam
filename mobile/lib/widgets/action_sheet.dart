import 'package:flutter/cupertino.dart';

import '../core/theme.dart';

class SheetAction<T> {
  const SheetAction(this.label, this.value, {this.destructive = false});

  final String label;
  final T value;
  final bool destructive;
}

/// iOS action sheet; resolves to the chosen action's value, or null on cancel.
Future<T?> showActionSheet<T>(
  BuildContext context, {
  String? title,
  String? message,
  required List<SheetAction<T>> actions,
}) {
  return showCupertinoModalPopup<T>(
    context: context,
    builder: (context) => CupertinoActionSheet(
      title: title == null ? null : Text(title),
      message: message == null ? null : Text(message),
      actions: [
        for (final action in actions)
          CupertinoActionSheetAction(
            isDestructiveAction: action.destructive,
            onPressed: () => Navigator.pop(context, action.value),
            child: Text(
              action.label,
              style: action.destructive
                  ? const TextStyle(color: AppColors.brick)
                  : null,
            ),
          ),
      ],
      cancelButton: CupertinoActionSheetAction(
        isDefaultAction: true,
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
    ),
  );
}
