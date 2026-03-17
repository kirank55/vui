# 50 Additional VUI Icons Plan - "Heavy Animation" Version

The user wants 50 additional icons that have **animation-heavy interactions**, specifically similar to the "hand-drawn" `check` icon (which uses `stroke-dasharray` and `stroke-dashoffset` for a pen-drawing effect).

This means moving away from simple `<animateTransform>` translations and rotations, and leaning heavily into:
1. **Path Drawing:** `stroke-dashoffset` from total length to 0 to look written.
2. **Path Morphing:** animating the `d` attribute to completely change shapes.
3. **Multi-Step Animations:** Combining multiple `<animate>` tags with chained `begin="mouseover; anim1.end"` or tight `keyTimes` for multi-stage reveals.

Here are 50 new icons and how they will be heavily animated using pure SMIL.

## 1. Interface & Essential Actions (10)
| Name | Visual Idea | Heavy SMIL Animation Strategy |
| :--- | :--- | :--- |
| `edit-2` (Pencil) | writing pencil | The pencil body is drawn in completely from tip to eraser (`stroke-dashoffset`), while the tip itself wiggles side to side. |
| `trash-2` (Bin) | Trash bin | The bin lines erase themselves (stroke draws out), lid flips open, then lines draw back in mimicking throwing something away. |
| `save` (Disk) | Floppy disk | The outer outline is hand-drawn around the perimeter, and the inner square "slides in" dynamically via path morph. |
| `list` (Menu) | 3 lines and 3 dots | Each dot draws itself in sequence (top, mid, bot), followed immediately by each line drawing horizontally like a pen stroke. |
| `grid` (Boxes) | 4 squares | A single continuous line zigzags to draw all 4 square perimeters perfectly in one fluid sweep via dashoffset. |
| `heart` | Heart outline | Draws from the top-center crotch down to the bottom tip along both left and right sides simultaneously, then pulses. |
| `thumbs-up` | Hand | The hand outline completely erases and rapidly redraws perfectly, ending with the thumb popping up (path morph). |
| `lock` | Padlock | The shackle line is drawn from left hinge over to the right catch, then snaps down with a satisfying bounce via keySplines. |
| `unlock` | Padlock | The shackle snaps open and then its stroke reverses, erasing the shackle out of existence. |
| `refresh` | Circular arrows | Both arrows draw themselves rapidly in a circle, chasing each other before snapping to their final arrowheads. |

## 2. Navigation & Location (10)
| Name | Visual Idea | Heavy SMIL Animation Strategy |
| :--- | :--- | :--- |
| `arrow-up` | Up arrow | The shaft is drawn from bottom to top, immediately followed by the arrowhead bursting out from the tip. |
| `arrow-down` | Down arrow | Same as above but downwards. |
| `map-pin` | Location pin | The pin draws its rounded top first, extends the stem down, then "stamps" the inner dot which ripples outward. |
| `compass` | Directions | The outer circle draws clockwise. The inner needle is drawn diagonally, then violently swings back and forth oscillating to a stop. |
| `home` | House | The walls draw up from the ground, the roof draws out from the peak, and the door draws last, popping open (morph). |
| `globe` | Earth wireframe | The outer circle draws, followed by the latitude/longitude lines wrapping around like string being tied around a ball. |
| `navigation` | Cursor arrow | Draws from the back tail up to the point, then detaches and flies forward by morphing into a smaller arrowhead. |
| `map` | Folded map | The map folds open via path morphing from a single column into three panels, and the path lines draw down the folds. |
| `send` | Paper plane | Erases from back to front, morphing into a straight line that shoots off the screen, then reappears and redraws into the plane. |
| `crosshair` | Target | The outer circle draws in, then the 4 crosshair tick marks shoot inward from the edges perfectly hitting the center. |

## 3. Communication & Media (10)
| Name | Visual Idea | Heavy SMIL Animation Strategy |
| :--- | :--- | :--- |
| `mail` | Envelope | The rectangular base is drawn, then the top flap draws up. It then folds down via a path morph to seal the envelope. |
| `message-square` | Chat bubble | The bubble draws in starting from the tail, sweeps fully around, and ends by dropping three dots sequentially inside. |
| `phone` | Handset | Draws the receiver curve first, then the earpieces pop on, the whole shape shakes violently for 3 frames (ringing). |
| `bell` | Alarm bell | The bell shape is drawn from top to bottom, the clapper drops out, and the whole bell swings back and forth. |
| `share-2` | Nodes | The center dot scales in, then the lines shoot outward like lasers to the side dots, which scale in upon impact. |
| `play` | Triangle | Draws the three sides sequentially, then morphs the triangle into two vertical bars (pause) and back again. |
| `pause` | 2 bars | Both bars erase themselves from bottom to top, then slam back down from top to bottom. |
| `volume-2` | Speaker | Speaker body draws, then the sound waves emit outward one by one, like ripples in a pond, fading as they grow. |
| `mic` | Microphone | The pill shape draws from bottom up, the stand draws down, and the pill morphs to expand slightly as if absorbing sound. |
| `camera` | Photo | The rectangle draws perfectly, the lens circle draws from the center, and the shutter clicks via a rapid path morph open/close. |

## 4. Files, Folders & Technology (10)
| Name | Visual Idea | Heavy SMIL Animation Strategy |
| :--- | :--- | :--- |
| `file` | Document | The outline draws around the long way, up to the dog-ear corner, which folds over via a smooth path morph. |
| `folder` | Tabbed folder | The back folder flap draws, then a document rectangle shoots up from inside, triggering the front flap to draw across it. |
| `paperclip` | Paper fastener | The stroke draws starting from the innermost tip, looping around and around until the entire clip is formed. |
| `download` | Cloud/Arrow | The arrow shoots downward into the bottom line, which absorbs the impact and morphs into a bouncy curve temporarily. |
| `upload` | Cloud/Arrow | The bottom line morphs, launching the arrow upward; the arrow draws itself out as it flies up. |
| `cloud` | Fluffy cloud | The bumps of the cloud are drawn sequentially from left to right, rippling slightly like wind blowing across. |
| `monitor` | Desktop | The screen rectangle draws, the stand drops down, and a tiny "loading" line draws across the center of the screen. |
| `smartphone` | Phone | The outer chassis draws smoothly, then the screen layout lines draw in rapidly from top to bottom. |
| `hard-drive` | Server disk | The cylinders draw from top to bottom, and tiny indicator lights blink on (stroke-width pulsing) sequentially. |
| `database` | Storage | The three stacked discs outline themselves perfectly in sequence, from top disc to the bottom disc. |

## 5. Status, Tools & Weather (10)
| Name | Visual Idea | Heavy SMIL Animation Strategy |
| :--- | :--- | :--- |
| `clock` | Time | The circular face draws, the hour hand drops into place, and the minute hand sweeps a full 360 degrees very quickly. |
| `star` | Favorite | The star outline draws from top point completely around without lifting the "pen", snapping to a close at the end. |
| `sun` | Sunny | The center circle draws immediately, then all 8 outer rays shoot outward from the core perfectly in sync. |
| `moon` | Crescent | The outer arc is drawn, followed by the inner arc. The shape then subtly rotates to look like it's setting. |
| `zap` | Lightning | The lightning bolt draws intensely from top-right to bottom-left with a very fast dash-offset, then flashes width momentarily. |
| `shield` | Security | The shield draws symmetrically down the left and right sides, meeting at the bottom point, then an inner checkmark draws in. |
| `award` | Ribbon medal | The circular medal draws, then the ribbon tails drop down and flutter (path morph waving). |
| `briefcase` | Work | The handle pops up, the bag rectangle draws out from the center, and the two latches snap shut (short line drawing). |
| `coffee` | Mug | The mug draws itself from handle to base. Then three steam lines draw themselves floating upward and wiggle. |
| `wifi` | Connectivity | The center dot pops in, then the three curved lines broadcast out sequentially from inner to outer. |

## Technical Implementation Approach for "Hand-Drawn" Effects

To achieve this level of heavy animation reliably using only SMIL (like the checkmark):
1. **Remove `<path pointer-events="none">` restrictions**: Ensure the target paths do not have `pointer-events="none"` so they can receive direct interactions, or wrap them in `<g>` tags.
2. **`stroke-dasharray` and `stroke-dashoffset` for drawing**: Set the `stroke-dasharray` to the precise, measured path length. Animate `stroke-dashoffset` from the full length down to `0`.
3. **Advanced Triggers**: Use `<g>` wrapping to act as the exact hit-target (like the 24x24 transparent rect) so animations trigger consistently on the whole cell area, and use the cascading nature of SMIL presentation attributes, applying them to `<g>` so the `<animate>` avoids ID-conflicts (`href`).
4. **KeyTimes for Sequencing**: Use `keyTimes="0; 0.5; 1"` alongside `keySplines` to control pacing so a single path drawing can pause, speed up, or stagger without needing multiple discrete animations.
5. **Path Morphs**: Ensure `path` elements have the exact same number of command points when using `<animate attributeName="d">`, enabling complex shapes to bend, wave, and snap fluidly.
