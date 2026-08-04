# Property Panel Standards for Builder Widgets

All future builder widgets must follow the same shared Property Panel control model.

## Core rules

1. New widgets must use shared Property Panel controls.
2. Do not create widget-specific alignment buttons.
3. Do not create custom dropdown styles for existing control types.
4. Alignment must use `AlignmentControl`.
5. Device selection must use `ResponsiveDeviceControl`.
6. Toggle settings must use `ToggleControl`.
7. Colors must use `ColorControl`.
8. Spacing must use `SpacingControl`.
9. Font settings must use the shared typography controls.
10. New shared control types must be added to the common `property-controls` folder before use.

## Required implementation pattern

- Reuse controls from the shared property-controls layer.
- Keep widget property editors consistent across the builder.
- Preserve existing widget data shape and behavior.
- Avoid local duplicate implementations for controls that already exist in the shared system.

## Review checklist

When adding or updating a widget property panel, confirm that:

- the control comes from the shared control set,
- no widget-specific variants are introduced for standard control types,
- the builder-wide UI remains visually and behaviorally consistent,
- any new shared control is placed in the common `property-controls` folder first.
