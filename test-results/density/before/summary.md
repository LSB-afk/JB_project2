# UI Density Measurement - before

| Route | Scroll height | Client height | Child sum | Layout spacing | Excess gap | Bottom waste | Visible items | Console errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
#dashboard | 3473 | 3473 | 3383 | 90 | 24 | 24 | 6 | 0
#inbox | 418 | 418 | 363 | 55 | 24 | 24 | 3 | 0
#cases | 1172 | 1172 | 1118 | 54 | 24 | 24 | 5 | 0
#approvals | 592 | 592 | 537 | 55 | 24 | 24 | 2 | 0
#runs | 624 | 624 | 569 | 55 | 24 | 24 | 7 | 0
#jeonse | 954 | 954 | 900 | 54 | 24 | 24 | 6 | 0
#goals | 348 | 348 | 294 | 54 | 24 | 24 | 10 | 0
#agents | 1845 | 1845 | 1779 | 66 | 24 | 24 | 14 | 0
#orgchart | 1444 | 1444 | 1389 | 55 | 24 | 24 | 5 | 0
#skills | 1565 | 1565 | 1499 | 66 | 24 | 24 | 21 | 0
#routines | 642 | 642 | 587 | 55 | 24 | 24 | 10 | 0
#activity | 618 | 618 | 564 | 54 | 24 | 24 | 11 | 0
#budget | 1287 | 1287 | 1209 | 78 | 24 | 24 | 7 | 0
#settings | 483 | 483 | 428 | 55 | 24 | 24 | 4 | 0

Measurement definition:
- `layoutSpacingPx` = `.page-content.scrollHeight - direct child height sum`.
- `excessGapPx` = gaps above the 16px baseline plus bottom waste below the last visible child.
- `visibleItems` counts cards, rows, run cards, agent cards, skill cards, evidence, audit, and table-like rows visible in the 1920x1080 viewport.
