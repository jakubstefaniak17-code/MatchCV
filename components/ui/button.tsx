import * as React from 'react';
import {cva,type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';
const buttonVariants=cva('button disabled:opacity-50 disabled:pointer-events-none',{
  variants:{variant:{default:'',secondary:'secondary',tertiary:'tertiary',destructive:'danger'},size:{default:'',sm:'small',icon:'small'}},
  defaultVariants:{variant:'default',size:'default'}
});
function Button({className,variant,size,type='button',...props}:React.ComponentProps<'button'>&VariantProps<typeof buttonVariants>){return <button type={type} data-slot="button" className={cn(buttonVariants({variant,size,className}))} {...props}/>}
export {Button,buttonVariants};
