package com.github.vadimkhristenko.hatsunemikutheme.wallpaper;

import com.intellij.ide.ui.LafManager;
import com.intellij.ide.ui.LafManagerListener;
import com.intellij.openapi.application.ApplicationManager;
import org.jetbrains.annotations.NotNull;

/** The drawn art follows the theme: Miku Dark gets teal on navy, Sakura Light gets rose on white. */
public final class ThemeListener implements LafManagerListener {
    @Override
    public void lookAndFeelChanged(@NotNull LafManager source) {
        if (WallpaperSettings.getInstance().getState().source != WallpaperSettings.Source.ART) return;
        ApplicationManager.getApplication().invokeLater(Wallpaper::apply);
    }
}
