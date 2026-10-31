import * as React from 'react';
import {cva,type VariantProps} from 'class-variance-authority';
import {cn} from '@/lib/utils';
const buttonVariants=cva('button disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2',{variants:{variant:{default:'',secondary:'secondary',destructive:'danger'},size:{default:'',sm:'small'}},defaultVariants:{variant:'default',size:'default'}});
function Button({className,variant,size,...props}:React.ComponentProps<'button'>&VariantProps<typeof buttonVariants>){return <button data-slot="button" className={cn(buttonVariants({variant,size,className}))} {...props}/>;}
export {Button,buttonVariants};
