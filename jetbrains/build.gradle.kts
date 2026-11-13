plugins {
    // Java support
    id("java")
    // Gradle IntelliJ Platform Plugin
    id("org.jetbrains.intellij.platform") version "2.18.1"
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        create(providers.gradleProperty("platformType"), providers.gradleProperty("platformVersion"))
    }
}

// 2024.2 is the first platform on Java 21, which is also what the IDE jars we compile against need.
tasks.withType<JavaCompile>().configureEach {
    options.release.set(providers.gradleProperty("javaVersion").map { it.toInt() })
    options.encoding = "UTF-8"
}

intellijPlatform {
    buildSearchableOptions = false

    pluginConfiguration {
        id.set(providers.gradleProperty("pluginGroup"))
        name.set(providers.gradleProperty("pluginName"))
        version.set(providers.gradleProperty("pluginVersion"))
        // Written from the commits by `bun tools/release/release.ts prepare`.
        changeNotes.set(providers.fileContents(layout.projectDirectory.file("change-notes.html")).asText)

        ideaVersion {
            sinceBuild.set(providers.gradleProperty("pluginSinceBuild"))
            // No upper bound: a theme plugin keeps working on new IDEs, and the Marketplace verifier
            // reports any API it loses. `provider { null }` drops until-build from plugin.xml.
            untilBuild.set(provider { null })
        }
    }

    signing {
        certificateChain = providers.environmentVariable("CERTIFICATE_CHAIN")
        privateKey = providers.environmentVariable("PRIVATE_KEY")
        password = providers.environmentVariable("PRIVATE_KEY_PASSWORD")
    }

    publishing {
        token.set(providers.environmentVariable("PUBLISH_TOKEN"))
        channels.set(listOf("default"))
    }
}
