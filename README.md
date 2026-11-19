# claudeskills-media

Binary media for [autonomousQ/claudeskills](https://github.com/autonomousQ/claudeskills), kept out of that repo so it stays small.

```
motion-graphics/
  en/<element-id>.gif     3 s previews, English edition (270x480, 15 fps)
  zh/<element-id>.gif     3 s previews, zh-HK edition
  benchmarks/             GL benchmark reference outputs
```

Direct link pattern: `https://raw.githubusercontent.com/autonomousQ/claudeskills-media/main/motion-graphics/<en|zh>/<id>.gif`

GIFs are rendered in claudeskills (2D in the cloud, 3D on the RTX desktop), optimized with `gifsicle -O3 --lossy=60`, then published here by `scripts/publish-gifs.py` in claudeskills.
