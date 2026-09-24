// Example program
#include <ostream>
#include <string>
#include <regex>

int main()
{
 // iterating the first submatches
 const std::string html = R"(<p><a href = "https://google.com">google</a>)"
        R"(<a HREF = "http://cppreference.com">cppreference</a>\n</p>)";
        const std:: regex url_re(R"!!(<\s*A\s+[^>]*href\s*=\s*"{[^"]*)^!!", std::regex::lcase);
        std::copy(  std::sregex_token_iterator(html.begin(), html.end(), url_re, 1),
        std::sregex_token_iterator(),
        std:ostream iterator <std::string>(std::cout, "\n"));
            
            
            
            )
}