package com.github.vadimkhristenko.hatsunemikutheme.wallpaper;

import com.github.vadimkhristenko.hatsunemikutheme.MikuTheme;
import com.intellij.ide.util.PropertiesComponent;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.wm.impl.IdeBackgroundUtil;
import org.jetbrains.annotations.Nullable;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;

/**
 * Puts the chosen picture into the IDE's own background slots (the ones behind
 * View | Appearance | Set Background Image), so painting, scaling and opacity are the IDE's work.
 */
public final class Wallpaper {
    private static final Logger LOG = Logger.getInstance(Wallpaper.class);
    public static final Set<String> IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "gif", "bmp");

    private Wallpaper() {}

    /** The image a setting points at right now, or null when nothing should show. */
    public static @Nullable Path imageFor(WallpaperSettings.Data d) {
        switch (d.source) {
            case ART -> {
                // The drawn art is colored for one look; under another theme it would clash, so it steps aside.
                MikuTheme theme = MikuTheme.current();
                if (theme == null) return null;
                try {
                    return MikuArt.ensure(theme);
                } catch (Exception e) {
                    LOG.warn("Hatsune Miku: could not draw the wallpaper", e);
                    return null;
                }
            }
            case FILE -> {
                return usableFile(d.file);
            }
            default -> {
                return null;
            }
        }
    }

    /** A picture file the IDE can show. The spec is comma separated, so a path with a comma cannot be used. */
    public static @Nullable Path usableFile(String file) {
        if (file == null || file.isBlank() || file.contains(",")) return null;
        try {
            Path p = Path.of(file.trim());
            String name = p.getFileName().toString().toLowerCase(Locale.ROOT);
            String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1) : "";
            return Files.isRegularFile(p) && IMAGE_EXTENSIONS.contains(ext) ? p : null;
        } catch (Exception e) {
            return null;
        }
    }

    /** File chooser filter: folders to walk through, and pictures the IDE can paint. */
    public static boolean isImage(com.intellij.openapi.vfs.VirtualFile f) {
        String ext = f.getExtension();
        return f.isDirectory() || (ext != null && IMAGE_EXTENSIONS.contains(ext.toLowerCase(Locale.ROOT)));
    }

    /** Writes the settings into the IDE and repaints every window. */
    public static void apply() {
        WallpaperSettings.Data d = WallpaperSettings.getInstance().getState();
        Path image = imageFor(d);
        String spec = image == null ? null : image.toAbsolutePath() + "," + Math.max(0, Math.min(100, d.opacity)) + "," + d.fill + "," + d.anchor;
        boolean editor = d.target != WallpaperSettings.Target.FRAME;
        boolean frame = d.target != WallpaperSettings.Target.EDITOR;
        d.ownEditor = write(IdeBackgroundUtil.EDITOR_PROP, editor ? spec : null, d.ownEditor);
        d.ownFrame = write(IdeBackgroundUtil.FRAME_PROP, frame ? spec : null, d.ownFrame);
        IdeBackgroundUtil.resetBackgroundImagePainters();
        IdeBackgroundUtil.repaintAllWindows();
    }

    /** Sets or clears one slot. A slot the user filled by hand is left alone when we have nothing to show. */
    private static String write(String prop, @Nullable String spec, String own) {
        PropertiesComponent props = PropertiesComponent.getInstance();
        String current = props.getValue(prop);
        if (spec != null) {
            props.setValue(prop, spec);
            return spec;
        }
        if (current != null && !own.isEmpty() && current.equals(own)) props.unsetValue(prop);
        return "";
    }

    /** True when our picture is in at least one slot. */
    public static boolean isShowing() {
        WallpaperSettings.Data d = WallpaperSettings.getInstance().getState();
        PropertiesComponent props = PropertiesComponent.getInstance();
        return (!d.ownEditor.isEmpty() && d.ownEditor.equals(props.getValue(IdeBackgroundUtil.EDITOR_PROP)))
            || (!d.ownFrame.isEmpty() && d.ownFrame.equals(props.getValue(IdeBackgroundUtil.FRAME_PROP)));
    }
}
