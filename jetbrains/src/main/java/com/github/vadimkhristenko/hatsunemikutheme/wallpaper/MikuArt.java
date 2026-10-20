package com.github.vadimkhristenko.hatsunemikutheme.wallpaper;

import com.github.vadimkhristenko.hatsunemikutheme.MikuTheme;
import com.intellij.openapi.application.PathManager;

import javax.imageio.ImageIO;
import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Ellipse2D;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * The drawn Miku wallpaper of the new tab, painted for the IDE: a sun, two twin tails and a thin pink one,
 * a staff with a few notes. Only the shapes are opaque, the rest is transparent, so the theme's own
 * background shows through and the IDE's opacity setting decides how loud the art is.
 */
public final class MikuArt {
    /** Bump when the drawing changes, so cached files are drawn again. */
    private static final int VERSION = 1;

    private MikuArt() {}

    /** The art for this look, drawn once per screen size and kept in the IDE config folder. */
    public static Path ensure(MikuTheme theme) throws IOException {
        Rectangle screen = largestScreen();
        int w = Math.min(3840, Math.max(1920, screen.width));
        int h = Math.min(2160, Math.max(1080, screen.height));
        Path dir = Path.of(PathManager.getConfigPath(), "hatsune-miku");
        Path file = dir.resolve("art-" + theme.id + "-" + w + "x" + h + "-v" + VERSION + ".png");
        if (Files.isRegularFile(file)) return file;
        Files.createDirectories(dir);
        Path tmp = dir.resolve(file.getFileName() + ".tmp");
        ImageIO.write(render(theme, w, h), "png", tmp.toFile());
        Files.move(tmp, file, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        return file;
    }

    private static Rectangle largestScreen() {
        Rectangle best = new Rectangle(0, 0, 2560, 1440);
        if (GraphicsEnvironment.isHeadless()) return best;
        for (var d : GraphicsEnvironment.getLocalGraphicsEnvironment().getScreenDevices()) {
            var mode = d.getDisplayMode();
            if ((long) mode.getWidth() * mode.getHeight() > (long) best.width * best.height) best = new Rectangle(mode.getWidth(), mode.getHeight());
        }
        return best;
    }

    private static Color alpha(Color c, double a) {
        return new Color(c.getRed(), c.getGreen(), c.getBlue(), (int) Math.round(a * 255));
    }

    public static BufferedImage render(MikuTheme t, int w, int h) {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);
            g.setComposite(AlphaComposite.SrcOver);
            double u = h / 100.0;

            // The sun sits right of center, where code rarely reaches.
            double r = 30 * u;
            g.setColor(alpha(t.accent, 0.28));
            g.fill(new Ellipse2D.Double(w * 0.70 - r, h * 0.40 - r, r * 2, r * 2));

            // Twin tails: two wide bands and a thin one in the second color, all at the same tilt.
            AffineTransform base = g.getTransform();
            g.rotate(Math.toRadians(22), w * 0.74, h * 0.5);
            double len = h * 1.6;
            double top = h * 0.5 - len / 2;
            band(g, w * 0.66, top, 7.5 * u, len, alpha(t.accent, 0.85));
            band(g, w * 0.76, top, 7.5 * u, len, alpha(t.accent, 0.55));
            band(g, w * 0.855, top, 1.8 * u, len, alpha(t.accent2, 0.9));
            g.setTransform(base);

            // A staff along the bottom right with notes on it, the way the Score layout draws a day.
            double x0 = w * 0.52;
            double x1 = w * 0.97;
            double y0 = h * 0.80;
            double gap = 2.2 * u;
            g.setStroke(new BasicStroke((float) Math.max(1.5, 0.18 * u)));
            g.setColor(alpha(t.accent, 0.55));
            for (int i = 0; i < 5; i++) g.draw(new java.awt.geom.Line2D.Double(x0, y0 + i * gap, x1, y0 + i * gap));
            double[][] notes = {{0.12, 3}, {0.27, 1.5}, {0.41, 2.5}, {0.58, 0.5}, {0.74, 2}, {0.88, 1}};
            for (int i = 0; i < notes.length; i++) {
                double nx = x0 + (x1 - x0) * notes[i][0];
                double ny = y0 + notes[i][1] * gap;
                note(g, nx, ny, gap, i % 3 == 2 ? t.accent2 : t.accent);
            }
            return img;
        } finally {
            g.dispose();
        }
    }

    private static void band(Graphics2D g, double x, double y, double width, double length, Color c) {
        g.setColor(c);
        g.fill(new RoundRectangle2D.Double(x, y, width, length, width, width));
    }

    private static void note(Graphics2D g, double x, double y, double gap, Color c) {
        g.setColor(c);
        AffineTransform keep = g.getTransform();
        g.rotate(Math.toRadians(-20), x, y);
        g.fill(new Ellipse2D.Double(x - gap * 0.75, y - gap * 0.52, gap * 1.5, gap * 1.04));
        g.setTransform(keep);
        g.fill(new java.awt.geom.Rectangle2D.Double(x + gap * 0.58, y - gap * 3.4, Math.max(1.5, gap * 0.14), gap * 3.4));
    }
}
