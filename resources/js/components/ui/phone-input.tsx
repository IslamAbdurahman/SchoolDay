import * as React from 'react';
import PhoneInputLib, { type Value } from 'react-phone-number-input';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-phone-number-input/style.css';
import { getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value?: string;
    onChange?: (value: Value | undefined) => void;
    defaultCountry?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, value, onChange, defaultCountry = 'UZ', ...props }, ref) => {
        return (
            <PhoneInputLib
                international
                defaultCountry={defaultCountry as any}
                value={(value as Value) || ''}
                onChange={onChange as any}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                inputComponent={InputComponent}
                {...props}
            />
        );
    }
);
PhoneInput.displayName = 'PhoneInput';

const InputComponent = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            {...props}
            ref={ref}
            className={cn('w-full border-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0', className)}
        />
    )
);
InputComponent.displayName = 'InputComponent';

export { PhoneInput };
