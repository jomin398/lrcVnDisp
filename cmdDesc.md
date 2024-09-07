# README

This project involves the use of a `cmd.lrc` file to synchronize lyrics with visual effects, such as text colors, animations, and background images. The file format appears to be for a karaoke-style system where lyrics or captions are displayed in sync with audio. Below is an explanation of the commands and their parameters.

## File Format: `.lrc`
The `.lrc` file format is traditionally used to provide time-stamped lyrics for music tracks. In this project, we use custom commands to add visual effects, such as text color and animation, along with the typical time synchronization of lyrics.

### Note
**Each cmd line should consist of only one line, and there should be no new line in the middle.**

### Syntax Breakdown
```lrc
[00:00.000] tShadowCol("#000000") tHlCol("#7c7c7c") tCol("#ffffff") label("Monika (CV.carimellevo)") tAni("zoomInRight") tSpeed("100") bg("monika", "fadeIn")
[00:10.110] label("null") tAni("slideInLeft") tPos("center") tEffect({"e":"sakura","c": 2, "s": { "top": "5px" }})
```
### time Format
- `[00:00.000]`: This is the timestamp in the format [mm:ss.sss] (minutes
.milliseconds). It represents the exact time in the audio when the following effects should be applied.
- `[00:10.110]`

###  Visual Effect Commands
- `tShadowCol("#000000")`:
    - Sets the shadow color of the text to `#000000` (black).
- `tHlCol("#7c7c7c")`:
    - Sets the highlight color of the text to `#7c7c7c` (a shade of gray).
- `tCol("#ffffff")`:
    - Sets the color of the text to as default as `#ffffff` (white).
- `label("placeholder")`:
    - Displays the label as character name at the specified timestamp.
    - pass the `"null"` as the empty.
- `tAni("zoomInRight"):`
    - Sets an animation effect where the text zooms in from the right. The animation type is "zoomInRight". (see [supported text Animations](./readme.md#supported-text-animations))
- `tSpeed("100")`:
    - Defines the speed of the text animation with a value of 100 milliseconds (500 is default)
- `bg("placeholder", "fadeIn")`:
    - Changes the background to an image or scene with a fade-in transition effect (as [supported text Animations](./readme.md#supported-text-animations))
- `tPos("center")`:
    - Sets the position of the text in the `"center"` of the text box.
    - pass the `"default"` as the default position as `"tl"` (top left)
- `tEffect(...)`:
    - must be JSON Object format. (see [text Effect Settings](#text-effect-settings))

# Text Effect Settings
Text Effect 는 JSON 형식으로 작성되어야되며, 벛꽃효과를 예시로 설명 하면 다음과 같은 속성들을 포함하고 있습니다.
```json
{"e":"sakura","c": 2, "s": { "top": "5px" }}
```
- **e**: 
  - **설명**: 텍스트 효과의 이름입니다.
  - **값**: `"sakura"` - 벚꽃 효과를 의미합니다.

- **c**: 
  - **설명**: 벚꽃잎의 갯수를 나타냅니다.
  - **값**: `2` - 두 개의 벚꽃잎이 사용됩니다.

- **s**: 
  - **설명**: CSS 스타일을 정의하는 객체입니다.
  - **속성**:
    - **top**: 
      - **설명**: 요소의 위쪽 위치를 설정합니다.
      - **값**: `"5px"` - 5픽셀의 위쪽 여백이 설정됩니다.

