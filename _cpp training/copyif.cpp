#include <algorithm>
#include <fstream>
#include <iostream>
#include <iterator>
#include <regex>
#include <string>

// functions attached to objects of type T = methods

class Env
{
private:
    double x;
    double y;
    double z;

// to find the member function (+ attached to rectangle objects)
public:

    void set_dimensions(double dx, double dy, double dz )
    {
        x = dx;
        y = dy;
        z = dz;
    }

    // function declaration = function prototype

    double mdspan();
};
// class member functions (mdspan()) can also be defined outside of the class definition
    // double Env:: is defining now (for a declaration) as a part of Env class even though is outside of the scope
    double Env::mdspan()
    {
        return x * y * z;
    }

int main() {

    Env Env1;

    Env1.set_dimensions(1, 2, 3);


std::cout << Env1.mdspan();

}
    
    
    