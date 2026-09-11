char *ft_itoa_base(uintmax_t num, uintmax_t base){
int i;
uintmax_t val_cp;
uintmax_t rem;
char *str;

val_cp = num;
i = 1;
while((val_cp /= base) >= 1)
    i++;
str = ft_strnew(i); // Basically what it does (char*)malloc(sizeof(char) * (i + 1))
str[i] = '\0';
while(i-- > 0)
{
    rem = num % base;
    str[i] = (rem > 9)? (rem-10) + 'a' : rem + '0';
    num /= base;
}
return (str);}

char a = 'x';
void* p0 = &a;
uintmax_t i = (uintmax_t)p0;
ft_putstr(ft_itoa_base(i, 16));
ft_putchar('\n');
printf("PrintF: %p", p0);