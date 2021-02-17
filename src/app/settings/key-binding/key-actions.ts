export const enum KeyActions {
    FocusChat = 'Focus chat',
    ToggleEscMenu = 'Toggle escape menu',
    OpenLobby = 'Open lobby menu',
    OpenSettings = 'Open settings',
    OpenInventory = 'Open inventory',
    OpenProfile = 'Open profile',
    LeaveLobby = 'Leave lobby',
    Logout = 'Logout',

    Save = 'Save',
    Undo = 'Undo',
    Redo = 'Redo',
    OpenMenu = 'Open menu',

    ShowStats = 'Show stats',
    Forward = 'Forward',
    Left = 'Left',
    Right = 'Right',
    Blank = 'Blank',
    NextSlot = 'Next slot',
    PrevSlot = 'Previous slot',
    Back = 'Back',
    BombLeft = 'Bomb left',
    BombRight = 'Bomb right',
    Token = 'Token',
    Ready = 'Ready',
}

export interface KeyBinding {
    action: KeyActions;
    primary: string;
    secondary: string;
    primaryChanged?: boolean;
    secondaryChanged?: boolean;
}

export interface KeyBindings {
    general: KeyBinding[];
    moves: KeyBinding[];
    editor: KeyBinding[];
}

type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
export type StaticKeyBindings = DeepReadonly<KeyBindings>;

export const DefaultBindings: StaticKeyBindings = {
    general: [
        { action: KeyActions.ToggleEscMenu, primary: 'Escape', secondary: 'n/a' },
        { action: KeyActions.OpenLobby, primary: 'l', secondary: 'n/a' },
        { action: KeyActions.OpenSettings, primary: 'o', secondary: 'n/a' },
        { action: KeyActions.OpenInventory, primary: 'i', secondary: 'n/a' },
        { action: KeyActions.OpenProfile, primary: 'p', secondary: 'n/a' },
        { action: KeyActions.FocusChat, primary: 't', secondary: 'Enter' },
        { action: KeyActions.LeaveLobby, primary: 'Ctrl + b', secondary: 'n/a' },
        { action: KeyActions.Logout, primary: 'Ctrl + l', secondary: 'n/a' },
        { action: KeyActions.ShowStats, primary: 'Tab', secondary: 'n/a' },
    ],
    moves: [
        { action: KeyActions.Left, primary: 'a', secondary: 'ArrowLeft' },
        { action: KeyActions.Forward, primary: 'w', secondary: 'ArrowUp' },
        { action: KeyActions.Right, primary: 'd', secondary: 'ArrowRight' },
        { action: KeyActions.Blank, primary: 's', secondary: 'ArrowDown' },
        { action: KeyActions.NextSlot, primary: 'Shift + S', secondary: 'Shift + ArrowDown' },
        { action: KeyActions.PrevSlot, primary: 'Shift + W', secondary: 'Shift + ArrowUp' },
        { action: KeyActions.Back, primary: 'Backspace', secondary: 'Ctrl + z' },
        { action: KeyActions.BombLeft, primary: 'q', secondary: 'Shift + ArrowLeft' },
        { action: KeyActions.BombRight, primary: 'e', secondary: 'Shift + ArrowRight' },
        { action: KeyActions.Token, primary: 'x', secondary: 'n/a' },
        { action: KeyActions.Ready, primary: 'Space', secondary: 'n/a' },
    ],
    editor: [
        { action: KeyActions.Save, primary: 'Ctrl + s', secondary: 'n/a' },
        { action: KeyActions.Undo, primary: 'Ctrl + z', secondary: 'n/a' },
        { action: KeyActions.Redo, primary: 'Ctrl + y', secondary: 'n/a' },
    ],
};
