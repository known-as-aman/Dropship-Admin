import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ data }) => {
    return (


        <nav className="flex">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">

                {data.map(({ title, path }, idx) => (
                    <li key={path}>
                        <div className="flex items-center gap-2">
                            {idx > 0 &&
                                <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                                </svg>
                            }
                            <Link to={path} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">{title}</Link>
                        </div>
                    </li>
                ))
                }
            </ol>
        </nav>

    );
}

export default Breadcrumb;