export const LANGUAGE_OPTIONS = [
    {
        key: 'cpp',
        label: 'C++',
        monacoLanguage: 'cpp',
        judge0LanguageId: 54,
        compilerOptions: '-std=c++17',
        starterCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
        ios::sync_with_stdio(false);
        cin.tie(nullptr);

        return 0;
}`
    },
    {
        key: 'c',
        label: 'C',
        monacoLanguage: 'c',
        judge0LanguageId: 50,
        compilerOptions: '-std=c11',
        starterCode: `#include <stdio.h>

int main(void) {
        return 0;
}`
    },
    {
        key: 'python',
        label: 'Python',
        monacoLanguage: 'python',
        judge0LanguageId: 71,
        compilerOptions: '',
        starterCode: `def main():
        pass


if __name__ == '__main__':
        main()`
    },
    {
        key: 'javascript',
        label: 'JavaScript',
        monacoLanguage: 'javascript',
        judge0LanguageId: 63,
        compilerOptions: '',
        starterCode: `function main() {
    // write your solution here
}

main();`
    },
    {
        key: 'java',
        label: 'Java',
        monacoLanguage: 'java',
        judge0LanguageId: 62,
        compilerOptions: '',
        starterCode: `public class Main {
        public static void main(String[] args) {
        }
}`
    }
];

export const DEFAULT_LANGUAGE_KEY = 'cpp';

export const STARTER_CODE = LANGUAGE_OPTIONS.find((language) => language.key === DEFAULT_LANGUAGE_KEY)?.starterCode || '';

export function getLanguageOption(key) {
    return LANGUAGE_OPTIONS.find((language) => language.key === key) || LANGUAGE_OPTIONS[0];
}
