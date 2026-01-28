import Filter from "./filter";

type SearchInputProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    filter?: FilterProps
};
type FilterProps = {
    options: string[];
    activeFilter: number;
    onFilterChange: (index: number) => void;
};

export default function Input({ value, onChange, placeholder = "Pesquisar...", className, filter }: SearchInputProps) {
    return (
        <div className="w-full flex justify-between items-center my-4">
            <div className="w-60 py-2 px-4 rounded-lg bg-slate-800 flex justify-between items-center">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="bg-transparent text-slate-200 outline-none w-full"
                    value={value}
                    onChange={onChange}
                />
                <i className="bi bi-search"></i>
            </div>
            {filter && (
                <Filter
                    options={filter.options}
                    activeFilter={filter.activeFilter}
                    onFilterChange={filter.onFilterChange}
                />
            )}
        </div>
    );
}