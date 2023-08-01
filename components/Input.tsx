
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export interface InputProps extends React.HTMLAttributes<HTMLDivElement>{

}

export default function Input({...props}: InputProps) {
    return (
        <div {...props}>
            <div className="flex items-center">
        <span
            className={`text-sm mr-3 font-medium text-white`}
        >
          Side by Side
        </span>
          <span
              aria-hidden="true"
              className={classNames(
                  "translate-x-5" ,
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              )}
          />
          <span
              className={`text-sm font-medium text-white`}
          >
            Compare
          </span>
            </div>
        </div>
    );
}
