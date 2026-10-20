package com.github.vadimkhristenko.hatsunemikutheme.wallpaper;

import com.github.vadimkhristenko.hatsunemikutheme.MikuBundle;
import com.github.vadimkhristenko.hatsunemikutheme.MikuTheme;
import com.intellij.openapi.fileChooser.FileChooser;
import com.intellij.openapi.fileChooser.FileChooserDescriptor;
import com.intellij.openapi.options.Configurable;
import com.intellij.openapi.ui.ComboBox;
import com.intellij.openapi.ui.TextFieldWithBrowseButton;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.ui.SimpleListCellRenderer;
import com.intellij.ui.components.JBLabel;
import com.intellij.util.ui.FormBuilder;
import com.intellij.util.ui.JBUI;
import com.intellij.util.ui.UIUtil;
import org.jetbrains.annotations.Nls;
import org.jetbrains.annotations.Nullable;

import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JSlider;
import java.awt.BorderLayout;
import java.util.Locale;
import java.util.Objects;

/** Settings | Appearance & Behavior | Hatsune Miku: a wallpaper for the editor or the whole window. */
public final class WallpaperConfigurable implements Configurable {
    private static final String[] FILLS = {"scale", "tile", "plain"};
    private static final String[] ANCHORS = {"top_left", "top_center", "top_right", "middle_left", "center", "middle_right", "bottom_left", "bottom_center", "bottom_right"};

    private ComboBox<WallpaperSettings.Source> source;
    private TextFieldWithBrowseButton file;
    private ComboBox<WallpaperSettings.Target> target;
    private JSlider opacity;
    private JBLabel opacityValue;
    private ComboBox<String> fill;
    private ComboBox<String> anchor;
    private JBLabel status;
    private JPanel panel;

    @Override
    public @Nls String getDisplayName() {
        return MikuBundle.message("settings.title");
    }

    @Override
    public @Nullable JComponent createComponent() {
        source = new ComboBox<>(WallpaperSettings.Source.values());
        source.setRenderer(SimpleListCellRenderer.create("", s -> MikuBundle.message("source." + s.name().toLowerCase(Locale.ROOT))));

        // The plain constructor reads the same on 2024.2 and on today's IDEs, unlike the factory helpers.
        FileChooserDescriptor images = new FileChooserDescriptor(true, false, false, false, false, false)
            .withTitle(MikuBundle.message("file.choose"))
            .withFileFilter(Wallpaper::isImage);
        file = new TextFieldWithBrowseButton();
        file.addActionListener(e -> {
            VirtualFile picked = FileChooser.chooseFile(images, file, null, null);
            if (picked != null) file.setText(picked.toNioPath().toString());
        });

        target = new ComboBox<>(WallpaperSettings.Target.values());
        target.setRenderer(SimpleListCellRenderer.create("", t -> MikuBundle.message("target." + t.name().toLowerCase(Locale.ROOT))));

        opacity = new JSlider(0, 100, 12);
        opacity.setMajorTickSpacing(25);
        opacity.setPaintTicks(true);
        opacityValue = new JBLabel();
        opacity.addChangeListener(e -> opacityValue.setText(opacity.getValue() + "%"));
        JPanel opacityRow = new JPanel(new BorderLayout(JBUI.scale(8), 0));
        opacityRow.add(opacity, BorderLayout.CENTER);
        opacityRow.add(opacityValue, BorderLayout.EAST);

        fill = new ComboBox<>(FILLS);
        fill.setRenderer(SimpleListCellRenderer.create("", f -> MikuBundle.message("fill." + f)));
        anchor = new ComboBox<>(ANCHORS);
        anchor.setRenderer(SimpleListCellRenderer.create("", a -> MikuBundle.message("anchor." + a)));

        status = new JBLabel();
        status.setForeground(UIUtil.getContextHelpForeground());
        JBLabel hint = new JBLabel(MikuBundle.message("settings.hint"));
        hint.setForeground(UIUtil.getContextHelpForeground());
        hint.setAllowAutoWrapping(true);

        source.addActionListener(e -> sync());
        file.getTextField().getDocument().addDocumentListener(new com.intellij.ui.DocumentAdapter() {
            @Override
            protected void textChanged(@org.jetbrains.annotations.NotNull javax.swing.event.DocumentEvent e) {
                sync();
            }
        });

        panel = FormBuilder.createFormBuilder()
            .addLabeledComponent(MikuBundle.message("label.source"), source)
            .addLabeledComponent(MikuBundle.message("label.file"), file)
            .addLabeledComponent(MikuBundle.message("label.target"), target)
            .addLabeledComponent(MikuBundle.message("label.opacity"), opacityRow)
            .addLabeledComponent(MikuBundle.message("label.fill"), fill)
            .addLabeledComponent(MikuBundle.message("label.anchor"), anchor)
            .addComponent(status, JBUI.scale(4))
            .addComponent(hint, JBUI.scale(12))
            .addComponentFillVertically(new JPanel(), 0)
            .getPanel();
        reset();
        return panel;
    }

    /** Enables what the chosen source uses and says why nothing would show. */
    private void sync() {
        WallpaperSettings.Source s = (WallpaperSettings.Source) source.getSelectedItem();
        boolean any = s != WallpaperSettings.Source.NONE;
        file.setEnabled(s == WallpaperSettings.Source.FILE);
        for (JComponent c : new JComponent[] {target, opacity, fill, anchor}) c.setEnabled(any);
        String note = "";
        if (s == WallpaperSettings.Source.ART && MikuTheme.current() == null) note = MikuBundle.message("status.notMiku");
        if (s == WallpaperSettings.Source.FILE) {
            String text = file.getText().trim();
            if (text.isEmpty()) note = MikuBundle.message("status.pickFile");
            else if (text.contains(",")) note = MikuBundle.message("status.comma");
            else if (Wallpaper.usableFile(text) == null) note = MikuBundle.message("status.badFile");
        }
        status.setText(note);
        status.setVisible(!note.isEmpty());
    }

    private WallpaperSettings.Data fromForm() {
        WallpaperSettings.Data d = WallpaperSettings.getInstance().getState().copy();
        d.source = (WallpaperSettings.Source) Objects.requireNonNull(source.getSelectedItem());
        d.file = file.getText().trim();
        d.target = (WallpaperSettings.Target) Objects.requireNonNull(target.getSelectedItem());
        d.opacity = opacity.getValue();
        d.fill = (String) Objects.requireNonNull(fill.getSelectedItem());
        d.anchor = (String) Objects.requireNonNull(anchor.getSelectedItem());
        return d;
    }

    @Override
    public boolean isModified() {
        WallpaperSettings.Data now = WallpaperSettings.getInstance().getState();
        WallpaperSettings.Data form = fromForm();
        return now.source != form.source || !now.file.equals(form.file) || now.target != form.target
            || now.opacity != form.opacity || !now.fill.equals(form.fill) || !now.anchor.equals(form.anchor);
    }

    @Override
    public void apply() {
        WallpaperSettings.getInstance().loadState(fromForm());
        Wallpaper.apply();
    }

    @Override
    public void reset() {
        WallpaperSettings.Data d = WallpaperSettings.getInstance().getState();
        source.setSelectedItem(d.source);
        file.setText(d.file);
        target.setSelectedItem(d.target);
        opacity.setValue(d.opacity);
        opacityValue.setText(d.opacity + "%");
        fill.setSelectedItem(d.fill);
        anchor.setSelectedItem(d.anchor);
        sync();
    }

    @Override
    public void disposeUIResources() {
        panel = null;
    }
}
