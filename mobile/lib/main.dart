import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';

void main() => runApp(
  // Screens offer "Try again"; silent auto-retries would hide errors behind
  // a spinner for up to a minute.
  ProviderScope(retry: (_, _) => null, child: const TaskboardApp()),
);
