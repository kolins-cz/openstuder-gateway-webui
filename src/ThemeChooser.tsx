import React from "react";

type Theme = {
    name: string,
    backgroundColor: string,
    foregroundColor: string,
    hoverOverlayColor: string,
    selectedOverlayColor: string
}

const themes: Array<Theme> = [
    {
        name: 'light',
        backgroundColor: '245, 245, 245',
        foregroundColor: '35, 35, 35',
        hoverOverlayColor: 'rgba(255, 255, 255, 0.1)',
        selectedOverlayColor: 'rgba(0, 0, 0, 0.2)'
    },
    {
        name: 'dark',
        backgroundColor: '35, 35, 35',
        foregroundColor: '245, 245, 245',
        hoverOverlayColor: 'rgba(0, 0, 0, 0.05)',
        selectedOverlayColor: 'rgba(0, 0, 0, 0.2)'
    }
];

const accentColors: Array<string> = [
    '84, 156, 181',
    '161, 171, 116',
    '190, 104, 158',
    '0, 143, 180',
    '244, 121, 32',
    '97, 187, 50'
];

class ThemeChooserState {
    public constructor() {
        this.theme = themes[0];
        this.customAccentColor = null;
    }

    theme: Theme;
    customAccentColor: string | null;
}

class ThemeChooser extends React.Component<{}, ThemeChooserState> {
    public constructor(props: object) {
        super(props);
    }

    public componentDidMount() {
        const currentThemeName = localStorage.getItem('theme');
        if (currentThemeName) {
            const theme = themes.find((theme) => theme.name === currentThemeName);
            if (theme) {
                this.changeTheme(theme, false);
            }
        }
        const accentColor = localStorage.getItem('accent');
        if (accentColor) {
            this.changeAccentColor(accentColor, false);
        }
    }

    public render() {
        return (
            <div className="theme-chooser">
                <div>
                    {themes.map((theme) => {
                        return (
                            <button key={theme.name} className={"theme " + theme.name} onClick={() => this.changeTheme(theme)}/>
                        )
                    })}
                    {accentColors.map((color) => {
                        return (
                            <button key={color} className="accent" style={{backgroundColor: 'rgb(' + color + ')'}} onClick={() => this.changeAccentColor(color)}/>
                        )
                    })}
                </div>
            </div>
        )
    }

    private changeTheme(theme: Theme, store: boolean = true) {
        if (store) {
            localStorage.setItem('theme', theme.name);
        }
        document.documentElement.style.setProperty('--background', theme.backgroundColor);
        document.documentElement.style.setProperty('--foreground', theme.foregroundColor);
        document.documentElement.style.setProperty('--hover-overlay', theme.hoverOverlayColor);
        document.documentElement.style.setProperty('--selected-overlay', theme.selectedOverlayColor);
    }

    private changeAccentColor(color: string, store: boolean = true) {
        if (store) {
            localStorage.setItem('accent', color);
        }
        document.documentElement.style.setProperty('--accent', color);
    }
}

export default ThemeChooser;
