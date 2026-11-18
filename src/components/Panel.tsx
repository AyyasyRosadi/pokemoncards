"use client";

import { Label, ListBox, Select, Slider, Switch, TextArea, TextField, Input } from "@heroui/react";
import type { Key, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ---------------------------------- Text ---------------------------------- */

export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  /** Teks bantuan / elemen tambahan di bawah input. */
  children?: ReactNode;
}

export function TextInput({ label, value, onChange, placeholder, maxLength, className, children }: TextInputProps) {
  return (
    <TextField className={cn("flex w-full flex-col gap-1", className)} value={value} onChange={onChange}>
      <Label className="text-xs font-semibold text-white/70">{label}</Label>
      <Input placeholder={placeholder} maxLength={maxLength} fullWidth />
      {children}
    </TextField>
  );
}

export interface TextAreaFieldProps extends Omit<TextInputProps, "maxLength"> {
  rows?: number;
  maxLength?: number;
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3, maxLength, className, children }: TextAreaFieldProps) {
  return (
    <TextField className={cn("flex w-full flex-col gap-1", className)} value={value} onChange={onChange}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-white/70">{label}</Label>
        {maxLength && (
          <span className="text-[10px] tabular-nums text-white/40">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <TextArea placeholder={placeholder} rows={rows} maxLength={maxLength} fullWidth />
      {children}
    </TextField>
  );
}

/* --------------------------------- Number --------------------------------- */

export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  children?: ReactNode;
}

export function NumberInput({ label, value, onChange, min = 0, max = 9999, step = 10, className, children }: NumberInputProps) {
  return (
    <TextField
      className={cn("flex w-full flex-col gap-1", className)}
      value={String(value)}
      onChange={(v) => {
        const n = parseInt(v, 10);
        onChange(Number.isNaN(n) ? min : Math.min(max, Math.max(min, n)));
      }}
    >
      <Label className="text-xs font-semibold text-white/70">{label}</Label>
      <Input type="number" inputMode="numeric" min={min} max={max} step={step} fullWidth />
      {children}
    </TextField>
  );
}

/* --------------------------------- Select --------------------------------- */

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Elemen kecil di depan label (ikon / titik warna). */
  leading?: ReactNode;
}

export interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  className?: string;
  children?: ReactNode;
}

export function SelectField<T extends string>({ label, value, onChange, options, className, children }: SelectFieldProps<T>) {
  const current = options.find((o) => o.value === value);
  return (
    <Select
      className={cn("flex w-full flex-col gap-1", className)}
      selectedKey={value}
      onSelectionChange={(key: Key | null) => {
        if (key != null) onChange(String(key) as T);
      }}
      aria-label={label}
    >
      <Label className="text-xs font-semibold text-white/70">{label}</Label>
      <Select.Trigger>
        <Select.Value>
          {() => (
            <span className="flex items-center gap-2">
              {current?.leading}
              {current?.label}
            </span>
          )}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
              <span className="flex items-center gap-2">
                {o.leading}
                {o.label}
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
      {children}
    </Select>
  );
}

/* --------------------------------- Slider --------------------------------- */

export interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Format angka yang ditampilkan di kanan label. */
  format?: (value: number) => string;
  className?: string;
  children?: ReactNode;
}

export function SliderField({ label, value, onChange, min, max, step = 1, format, className, children }: SliderFieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/70">{label}</span>
        <span className="text-xs tabular-nums text-white/50">{format ? format(value) : value}</span>
      </div>
      <Slider
        aria-label={label}
        value={value}
        minValue={min}
        maxValue={max}
        step={step}
        onChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      >
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
      {children}
    </div>
  );
}

/* --------------------------------- Switch --------------------------------- */

export interface SwitchFieldProps {
  label: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  children?: ReactNode;
}

export function SwitchField({ label, isSelected, onChange, className, children }: SwitchFieldProps) {
  return (
    <Switch className={cn("w-fit", className)} isSelected={isSelected} onChange={onChange}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <span className="text-xs font-semibold text-white/80">{label}</span>
        {children}
      </Switch.Content>
    </Switch>
  );
}
