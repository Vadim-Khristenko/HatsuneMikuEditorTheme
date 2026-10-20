package com.github.vadimkhristenko.hatsunemikutheme.wallpaper;

import com.intellij.openapi.actionSystem.ActionUpdateThread;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.ToggleAction;
import com.intellij.openapi.project.DumbAware;
import org.jetbrains.annotations.NotNull;

/** View | Appearance | Hatsune Miku Wallpaper: on with the last picture, or the drawn art the first time. */
public final class ToggleWallpaperAction extends ToggleAction implements DumbAware {
    /** The source to come back to when the wallpaper is switched on again. */
    private WallpaperSettings.Source last = WallpaperSettings.Source.ART;

    @Override
    public boolean isSelected(@NotNull AnActionEvent e) {
        return WallpaperSettings.getInstance().getState().source != WallpaperSettings.Source.NONE;
    }

    @Override
    public void setSelected(@NotNull AnActionEvent e, boolean on) {
        WallpaperSettings.Data d = WallpaperSettings.getInstance().getState();
        if (on) {
            d.source = last == WallpaperSettings.Source.FILE && Wallpaper.usableFile(d.file) == null ? WallpaperSettings.Source.ART : last;
        } else {
            last = d.source;
            d.source = WallpaperSettings.Source.NONE;
        }
        Wallpaper.apply();
    }

    @Override
    public @NotNull ActionUpdateThread getActionUpdateThread() {
        return ActionUpdateThread.BGT;
    }
}
