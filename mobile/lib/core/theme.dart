import 'package:flutter/material.dart';

abstract final class AppColors {
  static const wall = Color(0xFFEEF1F5);
  static const paper = Color(0xFFFFFFFF);
  static const ink = Color(0xFF1C2433);
  static const graphite = Color(0xFF5B6475);
  static const line = Color(0xFFD8DDE5);
  static const cobalt = Color(0xFF2D5BDA);
  static const brick = Color(0xFFC2362B);
}

ThemeData buildTheme() {
  const scheme = ColorScheme.light(
    primary: AppColors.cobalt,
    onPrimary: AppColors.paper,
    secondary: AppColors.cobalt,
    onSecondary: AppColors.paper,
    error: AppColors.brick,
    onError: AppColors.paper,
    surface: AppColors.paper,
    onSurface: AppColors.ink,
    onSurfaceVariant: AppColors.graphite,
    outline: AppColors.line,
    outlineVariant: AppColors.line,
    inverseSurface: AppColors.ink,
    onInverseSurface: AppColors.paper,
  );
  const radius8 = BorderRadius.all(Radius.circular(8));
  const buttonShape = RoundedRectangleBorder(
    borderRadius: BorderRadius.all(Radius.circular(10)),
  );

  final base = ThemeData(
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.wall,
    appBarTheme: AppBarTheme(
      // Plain wall while expanded, paper once content scrolls beneath it.
      backgroundColor: WidgetStateColor.resolveWith(
        (states) => states.contains(WidgetState.scrolledUnder)
            ? AppColors.paper
            : AppColors.wall,
      ),
      foregroundColor: AppColors.ink,
      centerTitle: true,
      surfaceTintColor: Colors.transparent,
      scrolledUnderElevation: 0,
      iconTheme: const IconThemeData(color: AppColors.cobalt),
      actionsIconTheme: const IconThemeData(color: AppColors.cobalt),
    ),
    filledButtonTheme: const FilledButtonThemeData(
      style: ButtonStyle(
        minimumSize: WidgetStatePropertyAll(Size(64, 48)),
        shape: WidgetStatePropertyAll(buttonShape),
        textStyle: WidgetStatePropertyAll(
          TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
    ),
    textButtonTheme: const TextButtonThemeData(
      style: ButtonStyle(
        minimumSize: WidgetStatePropertyAll(Size(44, 44)),
        shape: WidgetStatePropertyAll(buttonShape),
        textStyle: WidgetStatePropertyAll(
          TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      filled: true,
      fillColor: AppColors.paper,
      border: OutlineInputBorder(borderRadius: radius8),
      enabledBorder: OutlineInputBorder(
        borderRadius: radius8,
        borderSide: BorderSide(color: AppColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: radius8,
        borderSide: BorderSide(color: AppColors.cobalt, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: radius8,
        borderSide: BorderSide(color: AppColors.brick),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: radius8,
        borderSide: BorderSide(color: AppColors.brick, width: 2),
      ),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: AppColors.paper,
      modalBackgroundColor: AppColors.paper,
      surfaceTintColor: Colors.transparent,
      dragHandleColor: AppColors.line,
      showDragHandle: true,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
    ),
    snackBarTheme: const SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.ink,
      contentTextStyle: TextStyle(color: AppColors.paper, fontSize: 15),
      actionTextColor: Color(0xFFA9BFFF),
      shape: buttonShape,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.line,
      space: 1,
      thickness: 1,
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.cobalt,
    ),
  );

  final text = base.textTheme;
  return base.copyWith(
    textTheme: text.copyWith(
      // Large title (expanded) and nav bar title, closer to iOS weights.
      headlineMedium: text.headlineMedium?.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.w700,
      ),
      titleLarge: text.titleLarge?.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
      titleSmall: text.titleSmall?.copyWith(
        fontSize: 15,
        fontWeight: FontWeight.w600,
      ),
      bodySmall: text.bodySmall?.copyWith(
        fontSize: 13,
        color: AppColors.graphite,
      ),
    ),
  );
}
