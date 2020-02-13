/// See https://gist.github.com/mjackson/5311256

/// Converts a hue to its RGB value.
function hueToRGB(p: number, q: number, t: number): number {
  // Make sure 0 <= t <= 1
  if (t < 0) { t += 1 }
  if (t > 1) { t -= 1 }

  // Compute the hue
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t
  } else if (t < 1 / 2) {
    return q
  } else if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6
  } else {
    return p
  }
}

/// A color.
class Color {

  /// The hue value.
  public readonly h: number

  /// The saturation value.
  public readonly s: number

  /// The lightness value.
  public readonly l: number

  private constructor(h: number, s: number, l: number) {
    this.h = h
    this.s = s
    this.l = l
  }

  public get rgb(): { r: number, g: number, b: number } {
    if (this.s == 0) {
      return {
        r: this.l * 255,
        g: this.l * 255,
        b: this.l * 255,
      }
    } else {
      const q = this.l < 0.5
        ? this.l * (1 + this.s)
        : this.l + this.s - this.l * this.s
      const p = 2 * this.l - q
      return {
        r: hueToRGB(p, q, this.h + 1 / 3) * 255,
        g: hueToRGB(p, q, this.h) * 255,
        b: hueToRGB(p, q, this.h - 1 / 3) * 255,
      }
    }
  }

  /// Returns a shade of this color.
  public get shade(): Color {
    return new Color(this.h, this.s, Math.max(0, this.l - 0.05))
  }

  /// Returns a tint of this color.
  public get tint(): Color {
    return new Color(this.h, this.s, Math.max(0, this.l + 0.05))
  }

  /// Returns the css representation of this color.
  public get css(): string {
    const { r, g, b } = this.rgb
    return `rgb(${r}, ${g}, ${b})`
  }

  /// Creates a new color from its HSL values.
  public static hsl(h: number, s: number, l: number): Color {
    return new Color(h, s, l)
  }

  /// Creates a new color from its RGB values, in the range 0 .... 255.
  public static rgb(r: number, g: number, b: number): Color {
    r = r / 255
    g = g / 255
    b = b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    if (max == min) {
      return new Color(0, 0, l)
    } else {
      const d = max - min
      const s = l > 0.5
        ? d / (2 - max - min)
        : d / (max + min)

      let h = 0
      if (max == r) {
        h = (g - b) / d + (g < b ? 6 : 0)
      } else  if (max == g) {
        h = (b - r) / d + 2
      } else {
        h = (r - g) / d + 4
      }

      return new Color(h / 6, s, l)
    }
  }

  public static black   = Color.hsl(0, 0, 0)
  public static gray    = Color.hsl(0, 0, 0.7)
  public static white   = Color.hsl(0, 0, 1)
  public static red     = Color.rgb(244, 67, 54)
  public static blue    = Color.rgb(33, 150, 243)
  public static orange  = Color.rgb(255, 152, 0)

}

export default Color
