interface WebflowRadioOption {
  value: string;
  label: string;
}

interface WebflowRadioGroupProps {
  name: string;
  value?: string;
  options: WebflowRadioOption[];
  onChange: (value: string) => void;
  columns?: 1 | 2;
}

export function WebflowRadioGroup({
  name,
  value,
  options,
  onChange,
  columns = 2,
}: WebflowRadioGroupProps) {
  return (
    <div className={`form_radio-2col${columns === 2 ? ' form_radio-grid' : ''}`}>
      {options.map((option) => {
        const checked = value === option.value;
        const id = `${name}-${option.value}`;

        return (
          <label key={option.value} className="form_radio w-radio" htmlFor={id}>
            <div
              className={`w-form-formradioinput w-form-formradioinput--inputType-custom form_radio-icon w-radio-input${
                checked ? ' w--redirected-checked' : ''
              }`}
            />
            <input
              type="radio"
              id={id}
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
            />
            <span className="form_radio-label w-form-label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
