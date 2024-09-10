# lrcVnDisp
play lyrics file as like visual novel game.
this project refers to [liriliri's Project](https://github.com/liriliri/webvn)  

# how to use
1. download [this folder as example](./example/epiphany/)
2. passing the following file contents to upload popup.
    - by the way you can drop the folder on upload popup.
3. wait until waveform is loaded.
4. click the most left side of waveform.

# Supported features
1. synchronized lyrics (`.lrc`) with waveform (audio)
2. multiple bgi (background image) files
3. multiple stylesheet (`.css` ) files
4. multiple [text Animations](#supported-text-animations)
5. synchronized command lines as well as lyrics. (`cmd.lrc`) [command line formatting guide](./cmdDesc.md)
6. can set bg as youTube video with command line (`ytVod`)
7. textEffects
    - sakura

# todo
- manu buttons (setting menu)
    - [ ] play pause button
    - [ ] audio Volume
    - [ ] textSpeed debug
- [ ] support image transition with alpha image

# Supported text animations
- bounce
    - bounceIn
    - bounceInDown
    - bounceInLeft
    - bounceInRight
    - bounceInUp
- fade
    - fadeIn
    - fadeInDown
    - fadeInLeft
    - fadeInRight
    - fadeInUp
- rotate
    - rotateIn
    - rotateInDownLeft
    - rotateInDownRight
    - rotateInUpLeft
    - rotateInUpRight
    - rollIn
- flip
    - flipInX
    - flipInY
- slide
    - slideInUp
    - slideInDown
    - slideInLeft
    - slideInRight
- zoom
    - zoomIn
    - zoomInDown
    - zoomInUp
    - zoomInLeft
    - zoomInRight
- etc
    - lightSpeedIn