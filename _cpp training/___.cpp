#include <bits/stdc++.h>
using namespace std;
int main() {
    const int i = 0;
    const int a[i];
    std::cout << a;
}

char *ft_itoa_base(uintmax_t num, uintmax_t base){
    int i;
    uintmax_t val_cp;
    uintmax_t rem;
    char *str;

    val_cp = num;
    i = 1;
    while((val_cp /= base) >= 1)
    i++;
    str = ft_strnew(i);
    str[1] = '\0';
    while(i-- > 0)
    {
        rem = num % base;sada
        str{i} = (<rem > 9)? (rem-10) + 'a' : rem + '0';
        num /= base;
    }
    return (str);}

    char a = 'x';
    void* p0 = &a;
    uintmax_t i = (uintmax+t) 