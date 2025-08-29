import { App } from 'vue'
import { DefineComponent } from 'vue'

export interface DevNotepadProps {
  defaultPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  storagePrefix?: string
}

export interface DevNotepadMethods {
  openNotepad(): void
  closeNotepad(): void
  toggleNotepad(): void
  toggleMinimize(): void
  clearNote(): void
  isVisible(): boolean
  isMinimized(): boolean
}

export declare const DevNotepad: DefineComponent<
  DevNotepadProps,
  {},
  {},
  {},
  DevNotepadMethods
>

export interface VueDevNotepadPlugin {
  install(app: App, options?: any): void
}

declare const plugin: VueDevNotepadPlugin

export { plugin as default }