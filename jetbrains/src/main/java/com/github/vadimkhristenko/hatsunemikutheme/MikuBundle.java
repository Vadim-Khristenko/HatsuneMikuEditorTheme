package com.github.vadimkhristenko.hatsunemikutheme;

import com.intellij.DynamicBundle;
import org.jetbrains.annotations.Nls;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.PropertyKey;

public final class MikuBundle extends DynamicBundle {
    private static final String BUNDLE = "messages.MikuBundle";
    private static final MikuBundle INSTANCE = new MikuBundle();

    private MikuBundle() {
        super(MikuBundle.class, BUNDLE);
    }

    public static @Nls @NotNull String message(@NotNull @PropertyKey(resourceBundle = BUNDLE) String key, Object @NotNull ... params) {
        return INSTANCE.getMessage(key, params);
    }
}
